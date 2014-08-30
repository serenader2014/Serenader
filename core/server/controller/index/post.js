var Post = require('../../proxy').post;
var validator = require('validator');
var xss = require('xss');

var errorHandling = require('../../routes').error;


module.exports = function (router) {
    router.get('/blog', function (req, res, next) {
        Post.getAllPosts(function (err, p) {
            if (err) {
                errorHandling(req, res, {error: err, type: 500});
                return;
            }
            res.render('postlist', {posts: p});
        });
    });

    router.get('/blog/:id', function (req, res, next) {
        var id = validator.trim(xss(req.params.id));
        Post.getOnePostById(id, function (err, p) {
            if (err) {
                errorHandling(req, res, { error: err, type: 500});
                return;
            }
            if (p) {
                res.render('post', { post: p});
                p.views = p.views + 1;
                p.save();
            } else {
                errorHandling(req, res, { error: '找不到该文章。', type: 404});
                return;
            }
        });
    });
};