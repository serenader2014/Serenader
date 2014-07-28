var xss = require('xss');
var validator = require('validator');

var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Post = require('../../proxy').post;
var Category = require('../../proxy').category;
var errorHandling = require('../../routes').error;


module.exports = function (router) {

    router.get('/post', auth_user, function (req, res, next) {
        if (req.session.user.role === 'admin') {
            Post.getTenPosts(function (err, posts) {
                if (! err && posts) {
                    Category.getAll(function (err, c) {
                        if (! err && c) {
                            res.render('admin_post_content', {
                                adminPath: adminPath, 
                                locals: res.locals, 
                                posts: posts, 
                                categories: c
                            });
                        } else {
                            errorHandling(res, { error: err ? err : 'No category was found.', type: 404});
                            return false;
                        }
                    });

                } else {
                    errorHandling(res, { error: err ? err : 'No post was found.' , type: 404});
                    return false;
                }
            });
        } else {
            Post.getUserTenPosts(req.session.user.uid, function (err, posts) {
                if (! err && posts) {
                    Category.getAll(function (err, c) {
                        if (! err && c) {
                            res.render('admin_post_content', {
                                adminPath: adminPath, 
                                locals: res.locals, 
                                posts: posts, 
                                categories: c
                            });
                        } else {
                            errorHandling(res, { error: err ? err : 'No category was found.', type: 404});
                            return false;
                        }
                    });

                } else {
                    errorHandling(res, { error: err ? err : 'No post was found.' , type: 404});
                    return false;
                }                
            });
        }
        
    });

    router.get('/post/new', auth_user, function (req, res, next) {
        Category.getAll(function (err, c) {
            if (! err && c) {
                res.render('admin_new_post', {adminPath: adminPath, locals: res.locals, categories: c});
            } else {
                errorHandling(res, { error: err ? err : 'No category was found.', type: 404});
                return false;
            }
        });
    });

    router.get('/post/edit/:id', auth_user, function (req, res, next) {
        var id = req.params.id;

        Post.getOnePostById(id, function (err, p) {
            if (! err && p) {
                if (req.session.user.role !== 'admin' && p.author !== req.session.user.uid) {
                    res.redirect(adminPath+'/post');
                    return false;
                }
                Category.getAll(function (err, c) {
                    if (! err && c) {
                        res.render('admin_edit_post', {adminPath: adminPath, locals: res.locals, categories: c, post: p});
                    } else {
                        errorHandling(res, { error: err ? err : 'No category was found.', type: 404});
                        return false;
                    }
                });
            } else {
                errorHandling(res, { error: err ? err : 'No post was found.' , type: 404});
                return false;
            }
        }); 
        
    });

    router.post('/post/edit/:id', auth_user, function (req, res, next) {
        var now = new Date();
        var title = validator.trim(xss(req.body.title));
        var author = req.session.user.uid;
        var date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
        var post = validator.trim(xss(req.body.post));
        var tags = validator.trim(xss(req,body.tags));
        var category = validator.trim(xss(req.body.categories));
        var id = validator.trim(xss(req.params.id));

        Post.updatePost({
            _id: id,
            title: title,
            author: author,
            date: date,
            post: post,
            tags: tags,
            category: category
        }, function (err) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            res.redirect(adminPath+'/post');
        });
    });


    router.post('/post/delete/:id', auth_user, function (req, res, next) {
        var id = validator.trim(xss(req.params.id));
        Post.deletePost(id, function (err) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            res.redirect(adminPath+'/post');
        });
    });

    router.post('/post/new', auth_user, function (req, res, next) {
        var now = new Date();
        var title = validator.trim(xss(req.body.title));
        var author = req.session.user.uid;
        var date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
        var post = validator.trim(xss(req.body.post));
        var tags = validator.trim(xss(req.body.tags));
        var category = validator.trim(xss(req.body.categories));

        Post.createNewPost({
            title: title, 
            author: author, 
            date: date, 
            tags:tags, 
            post: post, 
            category: category
        }, function (err) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            res.redirect(adminPath+'/post');
        });
    });

    router.post('/category/new', auth_user, function (req, res, next) {
        var name = validator.trim(xss(req.body.name));

        Category.getOneByName(name, function (err, c) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            if (! c) {
                Category.createNew(name, function (err) {
                    if (err) res.send(err);
                    res.redirect(adminPath+'/post');
                });
            } else {
                errorHandling(res, { error: '该分类已存在。', type: 500});
                return false;
            }
        });
    });

    router.post('/category/edit/:id', auth_user, function (req, res, next) {
        var id = validator.trim(xss(req.params.id));
        var name = validator.trim(xss(req.body.name));

        Category.getOneByName(name, function (err, c) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            if (c) {
                Category.update(id, name, function (err) {
                    if (err) {
                        errorHandling(res, { error: err, type: 500});
                        return false;
                    }
                    res.redirect(adminPath+'/post');
                });
            }
        });
    });

    router.post('/category/delete/:id', auth_user, function (req, res, next) {
        var id = validator.trim(xss(req,params.id));
        Category.getOneById(id, function (err, c) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            if (c) {
                if (c.count > 0) {
                    errorHandling(res, {error: '该分类下面仍然有文章。删除前请确保分类已经没有文章。', type: 500});
                    return false;
                } else {
                    Category.delete(id, function (err) {
                        if (err) {
                            errorHandling(res, { error: err, type: 500});
                            return false;
                        }
                        res.redirect(adminPath+'/post');
                    });
                }
            }
        });
    });
};