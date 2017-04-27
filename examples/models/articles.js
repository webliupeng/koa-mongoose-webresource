var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    title:  String,
    author: String,
    body:   String,
    likes: Array
})


exports.schema = schema