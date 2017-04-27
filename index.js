var { WebResource, CollectionWebResource } = require("./lib/webresource")
let middleware = function(options) {
    return (
        async (ctx, next) => {
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
                wr.filterEnabled = true
                switch (ctx.method.toLowerCase()) {
                    case "get":
                        await wr.beforeRead()
                        ctx.body = await wr.read();
                        break;
                    case "put":
                        await wr.beforeUpdate(ctx.request.body)
                        ctx.body = await wr.update(ctx.request.body);
                        break;
                    case "delete":
                        await wr.beforeDelete()
                        ctx.body = await wr.delete();
                        break;
                    case "post":
                        await wr.beforeCreate(ctx.request.body)
                        ctx.body = await wr.create(ctx.request.body)
                        break;
                }
            } catch (error) {
                console.log(error, error.stack)
                next(error)
            }
        }
    )
}

exports.middleware = middleware
exports.CollectionWebResource = CollectionWebResource
exports.WebResource = WebResource