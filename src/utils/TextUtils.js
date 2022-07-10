const slug = require('vietnamese-slug');

module.exports.makeSlug = function(plainText) {
    return slug(plainText.trim()) + '-' + Date.now();
}

module.exports.makeSlug = function(collection, plainText, hashing = true) {
    if (hashing) {
        return '/'+ collection + '/'+ slug(plainText.trim()) + '-' + Date.now();
    }
    else {
        return '/'+ collection + '/'+ slug(plainText.trim());
    }
}