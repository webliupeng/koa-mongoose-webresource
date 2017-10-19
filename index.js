var { WebResource, CollectionWebResource } = require("./lib/webresource")
let middleware = function(options) {
    return (
        async (ctx, next) => {

            if (!ctx) {
                console.log("context is undefined")
            }
            var path = ctx.path
            if (options.path) {
                if (ctx.path.indexOf(options.path) == -1) {
                    next()
                    return;
                } else {
                    path = path.substring(ctx.path.indexOf(options.path)+options.path.length)
                }
            }

            var webresource = new WebResource(path, null, ctx)

            Object.assign(WebResource.prototype, {
                mongoose: options.mongoose,
                resourceClassLoad: options.resourceClassLoad
            })
            
            try {
                var wr = await webresource.firstRespondResource()

                var setBody = (body) => {
                    if (body) {
                        var arr = body
                        
                        var filter = (i) => { 
                            var o = i.toObject ? i.toObject() : i
                            var ifs = wr instanceof CollectionWebResource ? wr.invisableFieldsInCollections : wr.invisableFields
                            ifs.forEach((field)=> {
                                delete o[field]
                            })
                            return o
                        }

                        if (body instanceof Array) {
                            ctx.body = arr.map(filter)
                        } else {
                            ctx.body = filter(body)
                        }
                        
                    } else {
                        ctx.body = body
                    }
                }

                switch (ctx.method.toLowerCase()) {
                    case "get":
                        await wr.beforeRead()
                        setBody(wr.afterRead(await wr.read()))
                        break
                    case "put":
                        await wr.beforeUpdate(ctx.request.body)
                        setBody(wr.afterUpdate(await wr.update(ctx.request.body)))
                        break;
                    case "delete":
                        await wr.beforeDelete()
                        setBody(wr.afterDelete(await wr.delete()))
                        break;
                    case "post":
                        await wr.beforeCreate(ctx.request.body)
                        setBody(wr.afterCreate(await wr.create(ctx.request.body)))
                        break;
                }
            } catch (error) {
                console.log(error, error.stack)

                if (process.env.NODE_ENV == "development") {
                    ctx.body = error.toString()
                } else {
                    ctx.body = "error occured"
                }
                
            }
        }
    )
}

exports.middleware = middleware
exports.CollectionWebResource = CollectionWebResource
exports.WebResource = WebResource