var NotFoundError = () =>  Error("Not found")
const _ = require('lodash')
class WebResource {
    constructor(path, parent = null, context) {
        this.path = path.replace(/\/\//ig, "")
        this.parent = parent
        this.context = context
        if (!context) {
            console.log("you must pass context parameter ")
        }
    }

    get invisableFieldsInCollections() {
        return [];
    }

    get invisableFields() {
        return [];
    }

    get writeableFields() {
        return "*";
    }

    getClass(name) {
        if (name == "") return null
        return this.resourceClassLoad(name)
    }

    children() {
        return {}
    }

    async firstRespondResource(depth = 0) {

        var componants = this.path.split("/")
        var clsName = componants[depth]

        if (depth >= componants.length) {
            this.isResponsive = true
            return this;
        }

        var children = this.children()

        var cls = this.getClass(clsName)

        if (!cls && children[clsName] && children[clsName].prototype instanceof WebResource) {
            cls = children[clsName]
        }
        
        if (cls) {
            if (!(this instanceof RootWebResource)) {
                if (!children[clsName]) {
                    throw NotFoundError()
                }
            }

            wr = new cls(componants.join("/"), this, this.context)
        } else if (this.parent == null) {
            var wr = new RootWebResource(this.path, this, this.context)
        } else {
            throw NotFoundError()
        }
        if (componants.length == 0) {
            return wr;
        }
        return await wr.firstRespondResource(++depth)
    }

    async read(filter) {
        throw new Error("unimplemented read")
    }

    async delete() {
        this.context.status = 405

        return ""
    }

    async create() {
        this.context.status = 405
        return ""
    }

    async update() {
        this.context.status = 405
        return ""
    }

    afterUpdate(result) {
        return result
    }

    afterDelete(result) {
        return result
    }
    
    afterCreate(result) {
        return result
    }

    afterRead(result) {
        return result
    }

    async beforeRead() {}
    async beforeUpdate() {}
    async beforeDelete() {}
    async beforeCreate() {}
}

class RootWebResource extends WebResource {

    
}


class CollectionWebResource extends WebResource {
    getModelName() {
        return this.constructor.name.toLowerCase()
    }

    getModel() {
        return this.mongoose.model(this.getModelName())
    }

    getSorts() {
        return _.get(this.context, "query.sort", "_id:asc").split(":")
    }

    async read(condition = {}) {
        const limit = parseInt(_.get(this.context, "query.limit", 10))
        const start = parseInt(_.get(this.context, "query.start", 0))

        const sorts = this.getSorts()
        
        var populations = _.get(this.context, "query.populations", "").split(",")

        condition = Object.assign(condition, await this.getRelationData())

        var finder = this.getModel().find(condition)
        populations.forEach((p) => {
            finder.populate.apply(finder, p.split(":"))
        })

        if (sorts)
            finder.sort({[sorts[0]]: sorts[1] == "asc" ? 1 : -1})
        let list = await finder.skip(start).limit(limit)

        return list
    }

    async getChild(id) {
        var element = await this.getModel().findById(id)

        return element
    }

    async firstRespondResource(depth = 0) {

        var componants = this.path.split("/")

        if (depth >= componants.length) {
            this.isResponsive = true
            return this;
        }
        var id = componants[depth]
        var obj = await this.getChild(id)

        var self = this;
        var CollectionElementWebResource = class extends WebResource {
            get invisableFields() {
                return self.invisableFields;
            }

            getFilters() {
                return self.getFilters()
            }

            children() {
                return self.children()
            }

            read() {
                if (!obj) return null
                return obj 
            }

            async delete() {
                await obj.remove() 
                this.context.status = 204
            }

            async beforeUpdate(data) {
                await self.beforeUpdate(data)
            }


            async update(data) {
                if (this.writeableFields != "*") {
                    this.writeableFields.forEach((f)=> { delete data[f] })
                }

                Object.assign(obj, data)
                return this.filter('read', await obj.save())
            }
        }

        var wr = new CollectionElementWebResource(this.path, this, this.context)

        return await wr.firstRespondResource(++depth)
    }

    async beofreUpdate() {}
    async beofreDelete() {}
    async beofreCreate() {}

    async getRelationData() {
        var wr = this.parent
        if (!wr) {
            return {}
        }
        var data = {}
        do {
            if (wr instanceof CollectionWebResource) {
                continue
            }
            var parentChildren = wr.children ? wr.children() : {}
            
            if (parentChildren[this.constructor.name.toLowerCase()]) {
                var { key } = parentChildren[this.constructor.name.toLowerCase()]
                
                if (key) {
                    let o = await wr.read()
                    data[key] = o._id
                }
            }
            
        } while ((wr = wr.parent));

        return data
    }

    async create(data) {
    
        if (this.writeableFields != "*") {
            this.writeableFields.forEach((f)=> { delete data[f] })
        }

        Object.assign(data, await this.getRelationData())

        
        var model = this.getModel()
        
        try {
            var res = await model.create(data)
            this.context.status = 201
            return res;
        } catch (error) {
            this.context.status = 500
            throw error
        }
        
    }
}

exports.WebResource = WebResource
exports.CollectionWebResource = CollectionWebResource