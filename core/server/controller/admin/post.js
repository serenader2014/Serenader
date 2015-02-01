var validator = require('validator'),
    _ = require('lodash'),
    moment = require('moment'),
    auth_user = require('../../utils/auth_user'),
    Category = require('../../models').Category,
    postUtils = require('../api/post').utils,
    config = require('../../../../config').config,
    url = config.url,
    amount = config.api.amountPerRequest,
    errorHandling = require('../../utils/error'),
    log = require('../../utils/log')();


module.exports = function (router) {

    router.get(url.post, auth_user, function (req, res) {
        var user;
        user = req.session.user;
        function checkUser () {
            if (user.role === 'admin') {
                return postUtils.getAllPosts(amount, 1, user);
            } else {
                return postUtils.getUserPosts(amount, 1, user, user.uid);
            }
        }
        checkUser().then(function (posts) {
            return Category.getAll().then(function (categories) {
                var drafts = _.filter(posts, {published: false}),
                    p = _.filter(posts, {published: true});
                res.render('post_list', {
                    posts: p,
                    drafts: drafts,
                    categories: categories
                });
            });
        }).then(null, function (err) {
            log.error(err.stack);
            errorHandling(req, res, { error: err.message, type: 404 });
        });
    });

    router.get(url.newPost, auth_user, function (req, res) {
        Category.getAll().then(function (c) {
            res.render('post', {categories: c});
        }).then(null, function (err) {
            log.error(err.stack);
            errorHandling(req, res, { error: err.message, type: 404 });
        });
    });

    router.get(url.post + '/:id', auth_user, function (req, res) {
        var id = validator.trim(req.params.id);

        postUtils.getPost(id, req.session.user).then(function (post) {
            if (_.isEmpty(post)) {
                res.redirect(url.admin+'/post');
                return false;
            }
            return Category.getAll().then(function (c) {
                res.render('post', {
                    categories: c,
                    post: post
                });
            });
        }).then(null, function (err) {
            log.error(err.stack);
            errorHandling(req, res, { error: err.message, type: 404 });
        });
    });
};