var express = require('express');
var rootRouter = express.Router();
var config = require('../../config').config;
var setting = require('../../proxy').setting;
var post = require('../../proxy').post;
var errorHandling = require('../../routes').error;

rootRouter.get('/', function (req, res, next) {
    setting.getSetting(function (err, s) {
        if (err) {
            errorHandling(res, { error: err, type: 500});
            return;
        }
        var blogName = s ? s.name : config.name;
        var blogDesc = s ? s.desc : config.description;

        post.getTenPosts(function (err, posts) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return;
            }
            var publishedPost = [];
            posts.forEach(function (p, index) {
                if (p.published) {
                    publishedPost.push(p);
                }
            });
            res.render('homepage', { blogName: blogName, blogDesc: blogDesc, posts: publishedPost});
        });
    });
});

require('./gallery')(rootRouter);

module.exports = rootRouter;