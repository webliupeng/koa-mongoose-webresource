
var { WebResource } = require("./lib/webresource")


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
            var webresource = new WebResource(path, null)

            WebResource.resourceClassLoad = options.resourceClassLoad
            
            try {
                var wr = await webresource.responsiveResource()
                switch (ctx.method.toLowerCase()) {
                    case "get":
                        ctx.body = await wr.read();
                        break;
                    case "put":
                        ctx.body = await wr.update(ctx.request.body);
                        break;
                    case "delete":
                        ctx.body = await wr.delete();
                        break;
                    case "post":
                        ctx.body = await wr.create(ctx.request.body)
                        break;
                }
            } catch (error) {
                next()
            }
        }
    )
}


exports.middleware = middleware