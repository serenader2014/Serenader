var express = require('express'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    validator = require('validator'),
    rootRouter = express.Router(),
    post = require('../../models').Post,
    category = require('../../models').Category,
    errorHandling = require('../../utils/error'),
    locals = require('../../index').locals;

function getPosts (page) {
    return post.getPosts({published: true}, locals.setting.postsPerPage, page).then(function (posts) {
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
    getPosts(1).then(function (arr) {
        var posts = arr[0],
            total = arr[1];

        res.render('index', {posts: posts, total: Math.ceil(total/locals.setting.postsPerPage)});
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

    getPosts(page).then(function (arr) {
        var posts = arr[0],
            total = arr[1];

        res.render('index', {posts: posts, page: page, total: Math.ceil(total/locals.setting.postsPerPage)});
    }).catch(function (err) {
        errorHandling(req, res, {error: err.message, type: 500});
    });
});

require('./post')(rootRouter);

module.exports = rootRouter;