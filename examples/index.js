const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const app = new Koa();

app.use(bodyParser());


const { middleware } = require('../index')

app.use(middleware({
    path: 'api',
    resourceClassLoad: (name) => {
        console.log("this is loader", name, `${__dirname}/webresources/${name}`)
        try {
            return require(`${__dirname}/webresources/${name}`).default
        } catch (ex) {
            console.log('load excepiton', ex)
            return null
        }
    }
}))
app.listen(3000)