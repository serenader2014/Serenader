var express = require('express'),
    rootRouter = express.Router(),
    config = require('../../../../config').config,
    Setting = require('../../models').Setting,
    post = require('../../models').Post,
    errorHandling = require('../../utils/error');

rootRouter.get('/', function (req, res, next) {
    post.getHomePagePublishedPosts(function (err, posts) {
        if (err) {
            errorHandling(req, res, { error: err, type: 500});
            return;
        }
        res.render('index', {posts: posts});
    });
});

rootRouter.get('/loadmore', function (req, res, next) {
    var page = req.query.page,
        num = req.query.num;

    if (! page) {
        res.send('No page was send.');
        return;
    } else {
        post.getMorePosts(page*10, num, function (err, posts) {
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

// require('./gallery')(rootRouter);
require('./post')(rootRouter);

module.exports = rootRouter;