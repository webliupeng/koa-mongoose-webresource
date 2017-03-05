# koa-mongoose-webresource
koa-mongoose-webresource provides a resource abstract layer for koa to expose mongoose models as REST resources

# Install
    npm install koa-mongoose-webresource --save
    
# Usage
    const Koa = require('koa');
	const bodyParser = require('koa-bodyparser');
	const app = new Koa();

	const mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/koa-mongoose-webresource');
    var { middleware, CollectionWebResource } = require('koa-mongoose-webresource')
    
    var schema = new mongoose.Schema({
        title:  String,
        author: String,
        body:   String
    })
    
    class Posts extends CollectionWebResource {
    }
    
    mongoose.model('posts', schema)
    
    app.use(bodyParser());
    app.use(middleware({
        path: 'api',
        mongoose,
        resourceClassLoad: (resourceName) => {
            return Posts
        }
    }))
    app.listen(3000)


----------


	curl http://localhost:3000/api/posts