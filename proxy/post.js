var Post = require('../models').Post;
var Category = require('./category');

module.exports.createNewPost = function (options, callback) {
    var p = new Post();
    p.title = options.title;
    p.author = options.author;
    p.authorAvatar = options.authorAvatar;
    p.date = options.date;
    p.tags = options.tags;
    p.content = options.post;
    p.excerpt = options.post.substring(0, 350+Math.random()*100);
    p.category = options.category;
    if (options.published === true) {
        Category.increaseCount(options.category);
    }
    p.published = options.published;
    p.save(callback);
};

module.exports.updatePost = function (options, callback) {
    Post.findById(options.id, function (err, p) {
        if (err) {
            callback(err);
        }
        if (p) {
            var obj = {};
            if (options.title) { obj.title = options.title; }
            if (options.author) { obj.author = options.author; }
            if (options.authorAvatar) { obj.authorAvatar = options.authorAvatar; }
            if (options.date) { obj.date = options.date; }
            if (options.tags) { obj.tags = options.tags; }
            if (options.post) { obj.content = options.post; obj.excerpt = options.post.substring(0, 350+Math.random()*100);}
            if (options.published !== undefined) { obj.published = options.published; }
            if (options.category) { 
                if (options.published === true && p.published === true && options.category !== p.category) {
                    Category.increaseCount(options.category);
                    Category.decreaseCount(p.category);
                }
                if (options.published === false && p.published === true) {
                    Category.decreaseCount(p.category);
                }
                if (options.published === true && p.published === false) {
                    Category.increaseCount(options.category);
                }
                obj.category = options.category; 
            }
            Post.findByIdAndUpdate(options.id, obj, callback);
        }
    });
};

module.exports.getOnePostById = function (id, callback) {
    Post.findById(id, callback);
};

module.exports.getTenPosts = function (callback) {
    Post.find({}, null, {limit: 10, sort: {_id: -1}}, callback);
};


module.exports.getAllPosts = function (callback) {
    Post.find({}, 'title author category date', {sort: {_id: -1}}, callback);
};

module.exports.deletePost = function (id, callback) {
    Post.findById(id, function (err, p) {
        if (err) {
            callback(err);
        }
        if (p) {
            if (p.published === true) {
                Category.decreaseCount(p.category);
            }
            Post.findOneAndRemove({_id: id}, callback);
        }
    });
};

module.exports.getUserPosts = function (user, callback) {
    Post.find({author: user}, null, {sort: {_id: -1}}, callback);
};

module.exports.getUserTenPosts = function (user, callback) {
    Post.find({author: user}, null, {limit: 10, sort: {_id: -1}}, callback);
};

module.exports.getMoreTenPosts = function (page, callback) {
    Post.find({}, null, {limit: 10, skip: page}).sort({_id: -1}).exec(callback);
};

module.exports.getUserMoreTenPosts = function (user, page, callback) {
    Post.find({author: user}, null, {limit: 10, skip: page}).sort({_id: -1}).exec(callback);
};