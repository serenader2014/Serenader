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
    });

function getPosts (conditions, amount, page) {

    var targetPosts,
        tmpObj = {},
        total;

    _.forIn(conditions, function (value, key) {
        if (value && value.toString() !== 'undefined') {
            tmpObj[key] = value;
        }
    });

    targetPosts = this.find(tmpObj);

    return targetPosts.countAsync().then(function (count) {
        total = count;

        //////////////////////////////////////////////////////////////////////////////
        // a little trick to solve 'sort cannot be used with count' bug in mongoose //
        //////////////////////////////////////////////////////////////////////////////
        delete targetPosts.op;

        return targetPosts.sort({createDate: -1}).skip((page - 1)*amount).limit(amount).execAsync('find');
    }).then(function (posts) {
        return {
            total: +total,
            data: posts,
            page: +page,
            amount: +amount
        };
    });
}

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
        return self.findOneAndRemoveAsync({_id: id});
    });
};

PostSchema.statics.getPostById = function (id) {
    return this.findByIdAsync(id);
};
PostSchema.statics.getPostBySlug = function (slug) {
    return this.findOneAsync({slug: slug});
};
PostSchema.statics.getPosts = function (conditions, amount, page) {
    return getPosts.call(this, conditions, amount, page);
};
PostSchema.statics.getNearPosts = function (post) {
    var previous,
        next,
        date = post.createDate,
        _this = this;

    return this.findAsync({createDate: {$lt: date}, published: true}, {title: 1, author: 1, slug: 1, createDate: 1}, {sort: {createDate: -1}, limit: 1}).then(function (posts) {
        next = posts[0];
    }).then(function () {
        return _this.findAsync({createDate: {$gt: date}, published: true}, {title: 1, author: 1, slug: 1, createDate: 1}, {sort: {createDate: 1}, limit: 1});
    }).then(function (posts) {
        previous = posts[0];
    }).then(function () {
        return {
            next: next,
            previous: previous
        };
    });
};
var Post = module.exports = mongoose.model('Post', PostSchema);