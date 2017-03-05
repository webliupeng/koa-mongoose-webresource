var NotFoundError = Error("Not found")

class WebResource {
    constructor(path, parent = null, context) {
        this.path = path.replace(/\/\//ig, "")
        this.parent = parent
        this.context = context
    }

    getClass(name) {
        if (name == "") return null
        return WebResource.resourceClassLoad(name)
    }

    children() {
        return {}
    }

    async responsiveResource() {

        if (!this.path || this.path == "") {
            return this;
        }
        var componants = this.path.split("/")
        var clsName = componants.shift()

        var children = this.children()

        var cls = this.getClass(clsName)
        
        if (cls) {
            if (!(this instanceof RootWebResource)) {
                if (!children[clsName]) {
                    throw NotFoundError
                }
            }

            wr = new cls(componants.join("/"), this, this.context)
        } else if (this.parent == null) {

            var wr = new RootWebResource(componants.join("/"), this, this.context)
        } else {
            throw NotFoundError
        }
        if (componants.length == 0) {
            return wr;
        }
        return await wr.responsiveResource()
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

}

class RootWebResource extends WebResource {}


class CollectionWebResource extends WebResource {

    getModelName() {
        return this.constructor.name.toLowerCase()
    }

    getModel() {
        return this.mongoose.model(this.getModelName())
    }

    async read() {
        return await this.getModel().find(await this.getRelationData())
    }

    async getElement(id) {
        var element = await this.getModel().findOne({_id: id})

        return element
    }

    async responsiveResource() {

        var componants = this.path.split("/")
        var id = componants.shift()

        var obj = await this.getElement(id)

        var self = this;
        var CollectionElementWebResource = class extends WebResource {

            children() {
                return self.children()
            }

            read() { return obj }

            async delete() {
                await obj.remove() 
                this.context.status = 204
            }

            async update(data) {
                return await obj.update(data)
            }
        }

        var wr = new CollectionElementWebResource(componants.join("/"), this, this.context)


        return await wr.responsiveResource()
    }

    async beofreCreate() {

    }

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
        await this.beofreCreate(data)

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