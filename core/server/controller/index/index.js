var express       = require('express');
var _             = require('lodash');
var Promise       = require('bluebird');
var validator     = require('validator');
var rootRouter    = express.Router();
var post          = require('../../models').Post;
var category      = require('../../models').Category;
var errorHandling = require('../../utils/error');
var setting       = global.settings;
var url           = global.config.url;

function getPosts (page, amount) {
    return post.getPosts({published: true}, amount, page).then(function (posts) {
        var _posts = _.clone(posts.data);

        return _.reduce(_posts, function (promise, post) {
            return promise.then(function () {
                return category.getOneById(post.category).then(function (c) {
                    post.categoryName = c.name;
                });
            });
        }, Promise.resolve()).then(function () {
            return [_posts, posts.total];
        });
    });
}

rootRouter.get('/', function (req, res) {
    if (!global.initialized) {
        res.redirect(url.admin);
        return false;
    }
    getPosts(1, setting.postsPerPage).then(function (arr) {
        var posts = arr[0],
            total = arr[1];

        res.render('index', {posts: posts, pageNum: Math.ceil(total/setting.postsPerPage)});
    }).catch(function (err) {
        errorHandling(req, res, {error: err.message, type: 500});
    });
});

rootRouter.get('/page/:page', function (req, res) {
    var page = +validator.trim(req.params.page);

    if (!page || page.toString() === 'NaN') {
        res.redirect('/');
        return false;
    }

    getPosts(page, setting.postsPerPage).then(function (arr) {
        var posts = arr[0],
            total = arr[1];

        res.render('index', {posts: posts, page: page, pageNum: Math.ceil(total/setting.postsPerPage)});
    }).catch(function (err) {
        errorHandling(req, res, {error: err.message, type: 500});
    });
});

require('./post')(rootRouter);

module.exports = rootRouter;