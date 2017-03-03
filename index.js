
var { WebResource } = require("./lib/webresource")

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const app = new Koa();

app.use(bodyParser());

app.use(async (ctx, next) => {
    var webresource = new WebResource(ctx.path, null)


    WebResource.resourceLoader = app.resourceLoader
    
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
});

exports.app = app

