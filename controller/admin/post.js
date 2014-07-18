var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Post = require('../../proxy').post;
var Category = require('../../proxy').category;



module.exports = function (router) {

    router.get('/post', auth_user, function (req, res, next) {
        Post.getAllPosts(function (err, posts) {
            if (err) res.send(err);
            if (posts) {

                Category.getAllCategories(function (err, c) {
                    if (err) res.send(err);
                    if (c) {
                        res.render('admin_post_content', {adminPath: adminPath, locals: res.locals, posts: posts, categories: c});
                    }
                });

            }
        });
    });

    router.get('/post/new', auth_user, function (req, res, next) {
        Category.getAllCategories(function (err, c) {
            if (err) res.send(err);
            if (c) {
                res.render('admin_new_post', {adminPath: adminPath, locals: res.locals, categories: c});
            }
        });
    });

    router.post('/post/new', auth_user, function (req, res, next) {
        var now = new Date();
        var title = req.body.title;
        var author = req.session.user.uid;
        var date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
        var post = req.body.post;
        var tags = req.body.tag;
        var category = req.body.categories;

        Post.createNewPost(title, author, date, tags, post, category, function (err) {
            if (err) res.send(err);
            res.redirect(adminPath+'/post');
        });
    });

    router.post('/category/new', auth_user, function (req, res, next) {
        // TODO validate the req.body

        var name = req.body.name;

        // TODO 查重
        Category.createNewCategory(name, function (err) {
            if (err) res.send(err);
            res.redirect(adminPath+'/post');
        });
    });    
};