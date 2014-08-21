var Post = require('../../proxy').post;
var validator = require('validator');
var xss = require('xss');

var errorHandling = require('../../routes').error;


module.exports = function (router) {
    router.get('/post', function (req, res, next) {
        Post.getAllPost(function (err, p) {
            if (err) {
                errorHandling(req, res, {error: err, type: 500});
                return;
            }
            if (p) {
                res.render('postlist', {posts: p});
            }
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
            }
        });
    });
};