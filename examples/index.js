const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const app = new Koa();

app.use(bodyParser());

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/koa-mongoose-webresource');

const { middleware } = require('../index')

var models = ['articles', 'comments']
models.forEach((name) => {
    mongoose.model(name, require(`./models/${name}`).schema)
})


app.use(middleware({
    path: 'api',
    mongoose,
    resourceClassLoad: (name) => {
        try {
            return require(`${__dirname}/webresources/${name}`).default
        } catch (ex) {
            return null
        }
    }
}))
app.listen(3000)