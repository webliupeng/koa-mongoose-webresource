
var { CollectionWebResource } = require("../../lib/webresource")


class Articles extends CollectionWebResource {
    
    getSchema() {
        return {
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
        }
    }
}


exports.default = Articles
