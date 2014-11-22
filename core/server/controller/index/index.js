var express = require('express'),
    rootRouter = express.Router(),
    post = require('../../models').Post,
    errorHandling = require('../../utils/error');

rootRouter.get('/', function (req, res) {
    post.getHomePagePublishedPosts().then(function (posts) {
        res.render('index', {posts: posts});
    }).then(null, function (err) {
        errorHandling(req, res, { error: err.message, type: 500 });
    });
});

rootRouter.get('/loadmore', function (req, res) {
    var page = req.query.page,
        num = req.query.num;

    if (! page) {
        res.send('No page was send.');
        return;
    } else {
        post.getMorePosts(page*10, num).then(function (posts) {
            var publishedPost = [];
            posts.forEach(function (p) {
                if (p.published) {
                    publishedPost.push(p);
                }
            });
            res.json(publishedPost);
        }).then(null, function (err) {
            errorHandling(req, res, { error: err.message, type: 500});
        });
    }
});

// require('./gallery')(rootRouter);
require('./post')(rootRouter);

module.exports = rootRouter;