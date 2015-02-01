var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    htmlToText = require('html-to-text'),
    Category = require('./category'),

    PostSchema = new Schema({
        title: String,
        slug: {type: String, unique: true},
        author: String,
        createDate: Date,
        lastModifiedDate: Date,
        markdown: String,
        html: String,
        tags: Array,
        excerpt: String,
        published: Boolean,
        category: String,
        views: { type: Number, default: 0 }
    });

PostSchema.statics.create = function (options) {
    var p = new this();
    _.extend(p, options);
    p.excerpt = htmlToText.fromString(options.html).substring(0, 350+Math.random()*100);
    return p.saveAsync().spread(function (post) {
        return post;
    });
};
PostSchema.statics.update = function (options) {
    var self = this;

    return self.findByIdAsync(options.id).then(function (post) {
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
            return self.findByIdAndUpdateAsync(options.id, obj);
        });
    });
};

PostSchema.statics.adjustCategory = function (oldCategory, newCategory) {
    return this.findAsync({category: oldCategory}).then(function (posts) {
        return posts.reduce(function (p, post) {
            return p.then(function () {
                post.category = newCategory;
                return post.saveAsync();
            });
        }, Promise.resolve());
    });
};
PostSchema.statics.delete = function (id) {
    var self = this;
    return self.findByIdAsync(id).then(function (p) {
        if (p.published === true) {
            return Category.decreaseCount(p.category);
        }
    }).then(function () {
        return self.findOneAndRemove({_id: id}).exec();
    });
};

PostSchema.statics.getPostsByCate = function (name, amount, page) {
    return this.findAsync(
        {category: name}, null, {limit: amount, skip: (page - 1)*amount, sort: {_createDate: -1}}
        );
};
PostSchema.statics.getPostById = function (id) {
    return this.findByIdAsync(id);
};
PostSchema.statics.getPostBySlug = function (slug) {
    return this.findOneAsync({slug: slug});
};
PostSchema.statics.getUserPublishedPosts = function (user, amount, page) {
    return this.findAsync(
        {author: user, published: true}, null, {limit: amount, skip: (page - 1)*amount, sort: {createDate: -1}}
        );
};
PostSchema.statics.getUserAllPosts = function (user, amount, page) {
    return this.findAsync(
        {author: user}, null, {limit: amount, skip: (page - 1)*amount, sort: {createDate: -1}}
        );
};
PostSchema.statics.getAllPosts = function (amount, page) {
    return this.findAsync(
        {}, null, {limit: amount, skip: (page - 1)*amount, sort: {createDate: -1}}
        );
};
PostSchema.statics.getPublishedPosts = function (amount, page) {
    return this.findAsync(
        {published: true}, null, { limit: amount, skip: (page - 1)*amount, sort: { createDate: -1}}
        );
};

var Post = module.exports = mongoose.model('Post', PostSchema);