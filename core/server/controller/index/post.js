var validator = require('validator'),
    xss = require('xss'),
    Post = require('../../models').Post,
    errorHandling = require('../../utils/error'),
    url = require('../../../../config').config.url;


module.exports = function (router) {
    router.get(url.post, function (req, res) {
        Post.getAllPosts().then(function (p) {
            res.render('postlist', {posts: p});
        }).then(null, function (err) {
            errorHandling(req, res, { error: err.message, type: 500 });
        });
    });

    router.get(url.post + '/:id', function (req, res) {
        var id = validator.trim(xss(req.params.id));
        Post.getOnePostById(id).then(function (p) {
            if (p) {
                res.render('post', { post: p});
                p.views = p.views + 1;
                p.save();
            } else {
                errorHandling(req, res, { error: '找不到该文章。', type: 404});
                return;
            }
        }).then(null, function (err) {
            errorHandling(req, res, { error: err.message, type: 500 });
        });
    });
};