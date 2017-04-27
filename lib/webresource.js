var NotFoundError = () =>  Error("Not found")

class WebResource {
    constructor(path, parent = null, context) {
        this.path = path.replace(/\/\//ig, "")
        this.parent = parent
        this.context = context
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

    async read() {
        return ""
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
    async beforeRead() {}
    async beforeUpdate() {}
    async beforeDelete() {}
    async beforeCreate() {}
}

class RootWebResource extends WebResource {}


class CollectionWebResource extends WebResource {

    
    getFilters(type='read') {
        return []
    }

    filter(type, data) {
        if (!this.filterEnabled) {
            return data
        }
        if (data.toObject) {
            data = data.toObject()
        }
        let fields = this.getFilters(type)

        fields.forEach((field)=> {
            delete data[field]
        })

        return data
    }


    getModelName() {
        return this.constructor.name.toLowerCase()
    }

    getModel() {
        return this.mongoose.model(this.getModelName())
    }

    async read() {
        let list = await this.getModel().find(await this.getRelationData())

        return list.map(i => i.toObject()).map(i => {
            return this.filter('read', i)
        })
    }

    async getElement(id) {
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
        var obj = await this.getElement(id)

        var self = this;
        var CollectionElementWebResource = class extends WebResource {

            getFilters() {
                return self.getFilters()
            }

            children() {
                return self.children()
            }

            read() {
                if (!obj) return null;
                self.filterEnabled = true
                var ret = self.filter('read', obj)
                self.filterEnabled = false
                return ret 
            }

            async delete() {
                await obj.remove() 
                this.context.status = 204
            }

            async beforeUpdate(data) {
                await self.beforeUpdate(data)
            }

            async update(data) {
                this.filter('update', data);
                Object.assign(obj, data)
                return this.filter('read', await obj.save())
            }
        }

        var wr = new CollectionElementWebResource(this.path, this, this.context)
        wr.filterEnabled = self.filterEnabled
        return await wr.firstRespondResource(++depth)
    }

    async beofreUpdate() {}
    async beofreDelete() {}
    async beofreCreate() {}

    async getRelationData() {
        var wr = this.parent
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
        this.filter('create', data);

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