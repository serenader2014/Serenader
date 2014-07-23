var Post = require('../models').Post;
var Category = require('./category');

module.exports.createNewPost = function (title, author, date, tags, post, category, callback) {
    var p = new Post();
    p.title = title;
    p.author = author;
    p.date = date;
    p.tags = tags;
    p.post = post;
    p.category = category;
    // Category.increaseCount(category);
    p.save(callback);
};

module.exports.updatePost = function (id, title, author, date, tags, post, category, callback) {
    Post.update({_id: id}, {_id: id, title: title, author: author, date: date, tags: tags, post: post, category: category}, callback);
};

module.exports.getOnePostById = function (id, callback) {
    Post.findById(id, callback);
};

module.exports.getTenPosts = function (callback) {
    Post.find({}, null,{limit: 10}, callback);
};


module.exports.getAllPosts = function (callback) {
    Post.find({}, callback);
};

module.exports.deletePost = function (id, callback) {
    Post.findOneById(id, function (err, p) {
        if (err) {
            callback(err);
        }
        if (p) {
            // Category.decreaseCount(p.category);
            Post.findByIdAndRemove(id, callback);
        }
    });
};

module.exports.getUserPost = function (user, callback) {
    Post.find({author: user}, callback);
};

module.exports.getUserTenPosts = function (user, callback) {
    Post.find({author: user}, null, {limit: 10}, callback);
};
