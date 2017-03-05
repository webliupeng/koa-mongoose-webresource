var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    content: String,
    articleId: Object
})

exports.schema = schema

// try {
            
//         } catch (ex) {
//             return this.mongoose.model(this.getModelName(), );
//         }