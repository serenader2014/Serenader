var Post = require('../models').Post;

module.exports.createNewPost = function (title, author, date, tags, post, category, callback) {
    var p = new Post();
    p.title = title;
    p.author = author;
    p.date = date;
    p.tags = tags;
    p.post = post;
    p.category = category;
    p.save(callback);
};

module.exports.updatePost = function (id, title, author, date, tags, post, category, callback) {
    Post.findById(id, function (err, p) {
        if (err) callback(err);
        if (p) {
            p.title = title;
            p.author = author;
            p.date = date;
            p.tags = tags;
            p.post = post;
            p.category = category;
            p.save(callback);
        } else {
            callback();
        }
    });
};

module.exports.getOnePostById = function (id, callback) {
    Post.findById(id, callback);
};

module.exports.getTenPosts = function (callback) {
    Post.find({}, {limit: 10}, callback);
};


module.exports.getAllPosts = function (callback) {
    Post.find({}, callback);
};