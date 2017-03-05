
var { CollectionWebResource } = require("../../lib/webresource")


class Articles extends CollectionWebResource {

    children() {
        return {
            comments: { key: "articleId" }
        }
    }
}


exports.default = Articles
