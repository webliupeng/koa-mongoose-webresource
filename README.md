# koa-mongoose-webresource
koa-mongoose-webresource provides a resource abstract layer for koa to expose mongoose models as REST resources

# Requirements

 - NodeJS v7.4.0+ with --harmony-async-await 
 - Koa v2.0+

# Install
`koa-mongoose-webresource` require koa v2.0+ ,node v7.4.0 or higher and async function support.

    npm install koa-mongoose-webresource --save
# Usage
You could extend`CollectionWebResource` or `WebResource` base-webresource class to define your web-resource .

	var { CollectionWebResource } = require('koa-mongoose-webresource')
	class Posts extends CollectionWebResource {
		
	}
	
In the koa entrance.You just need to require the module `koa-mongoose-webresources` and enable the middle-wear `app.use(middleware({...}))` and implements resource class loader. as below code

    var middleware = require('koa-mongoose-webresource').middleware
   
    app.use(middleware({
        path: 'api',
        mongoose,
        resourceClassLoad: (resourceName) => {
            return Posts
        }
    }))

 
----------
When koa started, It will create these default mappings.

	GET     /posts           ->  list
	GET     /posts/:id       ->  detail
	POST    /posts           ->  create
	PUT     /posts/:id       ->  update
	DELETE  /posts/:id       ->  destroy

