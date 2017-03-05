var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    title:  String,
    author: String,
    body:   String
})


exports.schema = schema
// try {
            
//         } catch (ex) {
//             return this.mongoose.model(this.getModelName(), );
//         }