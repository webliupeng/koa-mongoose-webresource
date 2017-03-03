var NotFound = Error("Not found")

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/koa-webresource');
var Schema = mongoose.Schema;

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

    async responsiveResource() {
        if (!this.path || this.path == "") {
            return this;
        }
        var componants = this.path.split("/")
        var clsName = componants.shift()
        
        var cls = this.getClass(clsName)
        
        if (cls) {
            wr = new cls(componants.join("/"), this, this.context)
        } else if (this.parent == null) {
            var wr = new WebResource(componants.join("/"), this, this.context)
        } else {
            throw NotFound
        }
        if (componants.length == 0) {
            return wr;
        }
        return await wr.responsiveResource()
    }

    async read() {
        return "this is web resource"
    }

    async delete() {
    }

    async create() {
        return "can not write"
    }

    async update() { }

}



class CollectionWebResource extends WebResource {

    getModelName() {
        return this.constructor.name.toLowerCase()
    }

    getModel() {
        try {
            return mongoose.model(this.getModelName())
        } catch (ex) {
            return mongoose.model(this.getModelName(), new Schema(this.getSchema(), {collection:this.getModelName()}));
        }
    }

    async read() {
        return await this.getModel().find()
    }

    async getElement(id) {
        return await this.getModel().findById(id)
    }

    async responsiveResource() {
        var componants = this.path.split("/")
        var id = componants.shift()

        var obj = await this.getElement(id)
        var wr = new WebResource(componants.join("/"), this, this.context)

        wr.read = () => obj
       
        wr.delete = async () => { 
            await obj.remove() 
            this.context.status = 204
        }
        wr.update = async (data) => { await obj.update(data) }

        return await wr.responsiveResource()
    }

    async create(data) {
        var model = this.getModel()
        this.context.status = 201
        return await model.create(data)
    }
}

exports.WebResource = WebResource
exports.CollectionWebResource = CollectionWebResource