var Post = require('../models').Post;
var Category = require('./category');

module.exports.createNewPost = function (options, callback) {
    var p = new Post();
    p.title = options.title;
    p.author = options.author;
    p.date = options.date;
    p.tags = options.tags;
    p.post = options.post;
    p.category = options.category;
    Category.increaseCount(options.category);
    p.save(callback);
};

module.exports.updatePost = function (options, callback) {
    Post.update({_id: options.id}, 
        {
            _id: options.id, 
            title: options.title, 
            author: options.author, 
            date: options.date, 
            tags: options.tags, 
            post: options.post, 
            category: options.category
        }, callback);
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
            Category.decreaseCount(p.category);
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
