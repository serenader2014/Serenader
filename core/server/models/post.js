var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    htmlToText = require('html-to-text'),
    Category = require('./category'),
    Promise = require('bluebird'),

    PostSchema = new Schema({
        title: String,
        author: String,
        createDate: { year: Number, month: Number, day: Number, hour: Number, minute: Number, second: Number },
        lastModifiedDate: { year: Number, month: Number, day: Number, hour: Number, minute: Number, second: Number },
        markdown: String,
        html: String,
        tags: Array,
        excerpt: String,
        published: Boolean,
        category: String,
        views: { type: Number, default: 0 }
    });

PostSchema.statics.createNewPost = function (options) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var p = new self();
        _.extend(p, options);
        p.excerpt = htmlToText.fromString(options.html).substring(0, 350+Math.random()*100);
        p.save(function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(p);
            }
        });
    });
};
PostSchema.statics.updatePost = function (options) {
    var self = this;

    return self.findById(options.id).exec().then(function (post) {
        var obj = {};
        _.extend(obj, options);
        return Promise.resolve().then(function () {
            if (options.published === true && post.published === true && options.category !== post.category) {
                return Category.increaseCount(options.category).then(function () {
                    return Category.decreaseCount(post.category);
                });
            }
            if (options.published === false && post.published === true) {
                return Category.decreaseCount(post.category);
            }
            if (options.published === true && post.published === false) {
                return Category.increaseCount(options.category);
            }
        }).then(function () {
            options.excerpt = htmlToText.fromString(options.html).substring(0, 350+Math.random()*100);
            return self.findByIdAndUpdate(options.id, obj).exec();
        });
    });
};

PostSchema.statics.adjustCategory = function (oldCategory, newCategory) {
    return this.find({category: oldCategory}).exec().then(function (posts) {
        return posts.reduce(function (p, post) {
            return p.then(function () {
                return new Promise(function (resolve, reject) {
                    post.category = newCategory;
                    post.save(function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });
        }, Promise.resolve());
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
    return this.find({}, null, {sort: {_id: -1}}).exec();
};
PostSchema.statics.deletePost = function (id) {
    var self = this;
    return self.findById(id).exec().then(function (p) {
        if (p.published === true) {
            return Category.decreaseCount(p.category).then(function () {
                return self.findOneAndRemove({_id: id}).exec();
            });
        } 
        return self.findOneAndRemove({_id: id}).exec();
        
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