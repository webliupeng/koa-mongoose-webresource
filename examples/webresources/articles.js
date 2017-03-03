
var { CollectionWebResource } = require("../../lib/webresource")

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

class Articles extends CollectionWebResource {
    getModelName() {
        return 'articles'
    }

    getSchema() {
        return new Schema({
            title:  String,
            author: String,
            body:   String,
            comments: [{ body: String, date: Date }],
            date: { type: Date, default: Date.now },
            hidden: Boolean,
            meta: {
                votes: Number,
                favs:  Number
            }
        }, {collection: "articles"}); 
    }
}


exports.default = Articles
