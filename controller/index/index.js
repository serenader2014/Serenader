var express = require('express');
var rootRouter = express.Router();
var config = require('../../config').config;
var setting = require('../../proxy').setting;
var post = require('../../proxy').post;
var errorHandling = require('../../routes').error;

rootRouter.get('/', function (req, res, next) {
    setting.getSetting(function (err, s) {
        if (err) {
            errorHandling(req, res, { error: err, type: 500});
            return;
        }
        var blogName = s ? s.name : config.name;
        var blogDesc = s ? s.desc : config.description;

        post.getTenPublishedPosts(function (err, posts) {
            if (err) {
                errorHandling(req, res, { error: err, type: 500});
                return;
            }
            res.render('homepage', { blogName: blogName, blogDesc: blogDesc, posts: posts});
        });
    });
});

rootRouter.get('/loadmore', function (req, res, next) {
    var page = req.query.page;

    if (! page) {
        res.send('No page was send.');
        return;
    } else {
        post.getMoreTenPosts(page*10, function (err, posts) {
            if (err) {
                errorHandling(req, res, { error: err, type: 500});
                return;
            }
            var publishedPost = [];
            posts.forEach(function (p, index) {
                if (p.published) {
                    publishedPost.push(p);
                }
            });
            res.json(publishedPost);
        });
    }
});

require('./gallery')(rootRouter);
require('./post')(rootRouter);

module.exports = rootRouter;