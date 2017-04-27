
var { CollectionWebResource,WebResource } = require("../../lib/webresource")



class Likes extends CollectionWebResource {
    read() {
        return this.parent.read().likes || "[]"
    }
}

class Articles extends CollectionWebResource {

    getFilters(type) {
        return ['likes', '__v']
    }

    children() {
        return {
            comments: { key: "articleId" },
            likes: Likes
        }
    }
}


exports.default = Articles
