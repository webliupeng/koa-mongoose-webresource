var { app } = require('../')

app.resourceLoader = (name) => {
    console.log("this is loader", name, `${__dirname}/webresources/${name}`)
    try {
        return require(`${__dirname}/webresources/${name}`).default
    } catch (ex) {
        console.log('load excepiton', ex)
        return null
    }
    
}
app.listen(3000)