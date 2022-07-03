const slug = require('vietnamese-slug');

module.exports.makeSlug = function(plainText) {
    return slug(plainText) + '-' + Date.now();
}

module.exports.makeSlug = function(collection, plainText) {
    return collection + '/'+ slug(plainText) + '-' + Date.now();
}