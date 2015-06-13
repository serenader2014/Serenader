var validator     = require('validator');
var xss           = require('xss');
var Promise       = require('bluebird');
var _             = require('lodash');
var Post          = require('../../models').Post;
var Category      = require('../../models').Category;
var errorHandling = require('../../utils/error');
var setting       = global.setting;
var url           = global.config.url;

function getPosts (obj, page, amount) {
    return Post.getPosts(obj, amount, page).then(function (posts) {
        var _posts = _.clone(posts.data);

        return _.reduce(_posts, function (promise, post) {
            return promise.then(function () {
                return Category.getOneById(post.category).then(function (c) {
                    post.categoryName = c.name;
                });
            });
        }, Promise.resolve()).then(function () {
            return [_posts, posts.total];
        });
    });
}

module.exports = function (router) {
    router.get(url.post, function (req, res) {
        var posts, total, page, category, tag, obj, postsPerRequest, queries;
        postsPerRequest = setting.postsPerPage;
        page = +validator.trim(req.query.page) || 1;
        // 使用两次 decodeURIComponent 是为了修复 coding 的预览问题。
        category = decodeURIComponent(decodeURIComponent(validator.trim(req.query.category))) || undefined;
        tag = validator.trim(req.query.tag) || undefined;
        obj = {
            published: true,
            category: undefined,
            tags: tag
        };
        if (page.toString() == 'NaN') {
            page = 1;
        }
        queries = category ?
            (tag ? '&category=' + category + '&tag=' + tag : '&category=' + category) :
            (tag ? '&tag=' + tag : '');
        Promise.resolve().then(function () {
            if (category) {
                return Category.getOneByName(category).then(function (c) {
                    obj.category = c._id;
                });
            }
        }).then(function () {
            return getPosts(obj, page, postsPerRequest);
        }).then(function (data) {
            posts = data[0];
            total = data[1];
            return Category.getAll();
        }).then(function (categories) {
            res.render('archive', {
                posts: posts,
                categories: categories,
                total: total,
                pageNum: Math.ceil(total/postsPerRequest),
                otherQuery: queries,
                query: {
                    page: page,
                    category: category,
                    tag: tag
                }
            });
        }).catch(function (err) {
            errorHandling(req, res, {error: err.message, type: 502});
        });
    });

    router.get(url.post + '/:slug', function (req, res) {
        var slug = validator.trim(xss(req.params.slug));
        Post.getPostBySlug(slug).then(function (p) {
            if (p) {
                Category.getOneById(p.category).then(function (c) {
                    p.categoryName = c.name;
                }).then(function () {
                    return Post.getNearPosts(p);
                }).then(function (result) {
                    res.render('post', { post: p, next: result.next, previous: result.previous});
                });
            } else {
                errorHandling(req, res, { error: '找不到该文章。', type: 404});
                return;
            }
        }).catch(function (err) {
            errorHandling(req, res, { error: err.message, type: 500 });
        });
    });
};