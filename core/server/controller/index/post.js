var validator = require('validator'),
    xss = require('xss'),
    Post = require('../../models').Post,
    Category = require('../../models').Category,
    errorHandling = require('../../utils/error'),
    url = require('../../../../config').config.url;


module.exports = function (router) {
    // router.get(url.post, function (req, res) {
    //     Post.getPublishedPosts(20, 1).then(function (p) {
    //         res.render('archive', {posts: p});
    //     }).catch(function (err) {
    //         errorHandling(req, res, { error: err.message, type: 500 });
    //     });
    // });

    router.get(url.post + '/:slug', function (req, res) {
        var slug = validator.trim(xss(req.params.slug));
        Post.getPostBySlug(slug).then(function (p) {
            if (p) {
                Category.getOneById(p.category).then(function (c) {
                    p.categoryName = c.name;
                    res.render('post', { post: p});
                });
            } else {
                errorHandling(req, res, { error: '找不到该文章。', type: 404});
                return;
            }
        }).catch(function (err) {
            errorHandling(req, res, { error: err.message, type: 500 });
        });
    });
};