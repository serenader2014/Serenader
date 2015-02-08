var express = require('express'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    rootRouter = express.Router(),
    post = require('../../models').Post,
    category = require('../../models').Category,
    errorHandling = require('../../utils/error'),
    config = require('../../../../config').config;


rootRouter.get('/', function (req, res) {
    post.getPublishedPosts(config.blogConfig.posts_per_page, 1).then(function (posts) {
        var _posts = _.clone(posts);
        _.reduce(_posts, function (p, post) {
            return p.then(function () {
                return category.getOneById(post.category).then(function (c) {
                    post.categoryName = c.name;
                });
            });
        }, Promise.resolve()).then(function () {
            res.render('index', {posts: _posts});
        });
    }).then(null, function (err) {
        errorHandling(req, res, { error: err.message, type: 500 });
    });
});

require('./post')(rootRouter);

module.exports = rootRouter;