var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    Category = require('./category'),
    Promise = require('bluebird'),

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

PostSchema.statics.createNewPost = function (options) {
    var p = new this();
    p.title = options.title;
    p.author = options.author;
    p.date = options.date;
    p.tags = options.tags;
    p.content = options.post;
    p.excerpt = options.post.substring(0, 350+Math.random()*100);
    p.category = options.category;
    p.published = options.published;
    p.save();
    return p;
};
PostSchema.statics.updatePost = function (options) {
    var self = this;

    return self.findById(options.id).exec().then(function (post) {
        if (post) {
            var obj = {};
            _.extend(obj, options);
            if (options.category) {
                if (options.published === true && post.published === true && options.category !== post.category) {
                    return Category.increaseCount(options.category).then(function () {
                        return Category.decreaseCount(p.category);
                    }).then(function () {
                        return self.findByIdAndUpdate(options.id, obj).exec();
                    });
                }
                if (options.published === false && p.published === true) {
                    return Category.decreaseCount(p.category).then(function () {
                        return self.findByIdAndUpdate(options.id, obj).exec();
                    });
                }
                if (options.published === true && p.published === false) {
                    return Category.increaseCount(options.category).then(function () {
                        return self.findByIdAndUpdate(options.id, obj).exec();
                    });
                }
                
            }
        }
    });

};

PostSchema.statics.getPostsByCate = function (name) {
    return this.find({category: name}, null, {sort: {_id: -1}}).exec();
};
PostSchema.statics.getOnePostById = function (id) {
    return this.findById(id).exec();
};
PostSchema.statics.getTenPosts = function () {
    return this.find({}, null, {limit: 10, sort: {_id: -1}}).exec();
};
PostSchema.statics.getHomePagePublishedPosts = function () {
    return this.find(
        { published: true }, null, { limit: require('../index').setting.posts_per_page, sort: { _id: -1 } }
        ).exec();
};
PostSchema.statics.getAllPosts = function () {
    return this.find({}, 'title author category date', {sort: {_id: -1}}).exec();
};
PostSchema.statics.deletePost = function (id) {
    var self = this;
    return self.findById(id).exec().then(function (p) {
        if (p) {
            if (p.published === true) {
                return Category.decreaseCount(p.category).then(function () {
                    return self.findOneAndRemove({_id: id}, callback);
                });
            }
        }
    });
};

PostSchema.statics.getUserPosts = function (user) {
    return this.find({author: user}, null, {sort: {_id: -1}}).exec();
};

PostSchema.statics.getUserTenPosts = function (user) {
    return this.find({author: user}, null, {limit: 10, sort: {_id: -1}}).exec();
};
PostSchema.statics.getMorePosts = function (page, num) {
    return this.find({}, null, {limit: num, skip: page}).sort({_id: -1}).exec();
};
PostSchema.statics.getUserMoreTenPosts = function (user, page) {
    return this.find({author: user}, null, {limit: 10, skip: page,  sort: {_id: -1}}).exec();
};

var Post = module.exports = mongoose.model('Post', PostSchema);