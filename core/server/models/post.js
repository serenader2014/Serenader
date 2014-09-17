var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    Category = require('./category'),

    PostSchema = new Schema({
        title: { type: String },
        author: { type: String },
        date: { type: Array },
        tags: { type: Array },
        content: { type: String },
        excerpt: { type: String },
        published: { type: Boolean },
        category: { type: String },
        views: { type: Number, default: 0 }
    });

PostSchema.statics.createNewPost = function (options, callback) {
    var p = new this();
    p.title = options.title;
    p.author = options.author;
    p.date = options.date;
    p.tags = options.tags;
    p.content = options.post;
    p.excerpt = options.post.substring(0, 350+Math.random()*100);
    p.category = options.category;
    p.published = options.published;
    p.save(callback);
};
PostSchema.statics.updatePost = function (options, callback) {
    var self = this;
    self.findById(options.id, function (err, p) {
        if (err) {
            callback(err);
        }
        if (p) {
            var obj = {};

            _.extend(obj, options);
            console.log(options.tags);
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
            }
            self.findByIdAndUpdate(options.id, obj, callback);
        }
    });
};

PostSchema.statics.getPostsByCate = function (name, callback) {
    this.find({category: name}, null, {sort: {_id: -1}},callback);
};
PostSchema.statics.getOnePostById = function (id, callback) {
    this.findById(id, callback);
};
PostSchema.statics.getTenPosts = function (callback) {
    this.find({}, null, {limit: 10, sort: {_id: -1}}, callback);
};
PostSchema.statics.getHomePagePublishedPosts = function (callback) {
    this.find({published: true}, null, {limit: require('../index').setting.posts_per_page, sort: {_id: -1}}, callback);
};
PostSchema.statics.getAllPosts = function (callback) {
    this.find({}, 'title author category date', {sort: {_id: -1}}, callback);
};
PostSchema.statics.deletePost = function (id, callback) {
    var self = this;
    self.findById(id, function (err, p) {
        if (err) {
            callback(err);
        }
        if (p) {
            if (p.published === true) {
                Category.decreaseCount(p.category);
            }
            self.findOneAndRemove({_id: id}, callback);
        }
    });
};

PostSchema.statics.getUserPosts = function (user, callback) {
    this.find({author: user}, null, {sort: {_id: -1}}, callback);
};

PostSchema.statics.getUserTenPosts = function (user, callback) {
    this.find({author: user}, null, {limit: 10, sort: {_id: -1}}, callback);
};
PostSchema.statics.getMorePosts = function (page, num, callback) {
    this.find({}, null, {limit: num, skip: page}).sort({_id: -1}).exec(callback);
};
PostSchema.statics.getUserMoreTenPosts = function (user, page, callback) {
    this.find({author: user}, null, {limit: 10, skip: page,  sort: {_id: -1}}, callback);
};

var Post = module.exports = mongoose.model('Post', PostSchema);