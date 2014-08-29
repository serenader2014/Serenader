var xss = require('xss');
var validator = require('validator');

var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Post = require('../../proxy').post;
var Category = require('../../proxy').category;
var errorHandling = require('../../routes').error;


module.exports = function (router) {

    router.get('/post', auth_user, function (req, res, next) {
        Post.getUserPosts(req.session.user.uid, function (err, posts) {
            if (! err && posts) {
                Category.getAll(function (err, c) {
                    if (! err && c) {
                        var drafts = [];
                        posts.forEach(function (p, i) {
                            if (! p.published) {
                                drafts.push(p);
                                posts[i] = '';
                            }
                        });
                        res.render('admin_post_content', {
                            adminPath: adminPath, 
                            locals: res.locals, 
                            posts: posts,
                            drafts: drafts,
                            categories: c
                        });
                    } else {
                        errorHandling(req, res, { error: err ? err : 'No category was found.', type: 404});
                        return false;
                    }
                });

            } else {
                errorHandling(req, res, { error: err ? err : 'No post was found.' , type: 404});
                return false;
            }                
        });        
    });

    router.get('/post/new', auth_user, function (req, res, next) {
        Category.getAll(function (err, c) {
            if (! err && c) {
                if (isMobile(req)) {
                    res.render('admin_new_post_mobile', {adminPath: adminPath, locals: res.locals, categories: c});
                } else {
                    res.render('admin_new_post', {adminPath: adminPath, locals: res.locals, categories: c});
                }
            } else {
                errorHandling(req, res, { error: err ? err : 'No category was found.', type: 404});
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
                        if (isMobile(req)) {
                            res.render('admin_edit_post_mobile', {
                                adminPath: adminPath, 
                                locals: res.locals, 
                                categories: c, 
                                post: p
                            });
                        } else {
                            res.render('admin_edit_post', {
                                adminPath: adminPath, 
                                locals: res.locals, 
                                categories: c, 
                                post: p
                            });
                        }
                    } else {
                        errorHandling(req, res, { error: err ? err : 'No category was found.', type: 404});
                        return false;
                    }
                });
            } else {
                errorHandling(req, res, { error: err ? err : 'No post was found.' , type: 404});
                return false;
            }
        }); 
        
    });

    router.post('/post/edit/:id', auth_user, function (req, res, next) {
        if (! req.body.post || ! req.body.title || ! req.body.categories) {
            errorHandling(req, res, { error: '请完善文章信息。', type: 401});
            return false;
        }
        var now = new Date();
        var title = validator.trim(xss(req.body.title));
        var author = req.session.user.uid;
        var avatar = req.session.user.avatar;
        var date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
        var post = validator.trim(xss(req.body.post));
        var category = validator.trim(xss(req.body.categories));
        var id = validator.trim(xss(req.params.id));
        var published = validator.trim(xss(req.body.publish));
        published = published === 'false' ? false : (published === 'true' ? true : undefined);
        if (published === undefined) {
            res.send({
                status: 0,
                id: 0
            });
            return;
        }        
        var tags;
        if (Object.prototype.toString.call(req.body.tags) === '[object Array]') {
            tags  =[];
            req.body.tags.forEach(function (tag) {
                tags.push(validator.trim(xss(tag)));
            });
        } else if (Object.prototype.toString.call(req.body.tags) === '[object String]') {
            tags = validator.trim(xss(req.body.tags));
        }

        Post.updatePost({
            id: id,
            title: title,
            author: author,
            authorAvatar: avatar,
            date: date,
            post: post,
            tags: tags,
            published: published,
            category: category
        }, function (err) {
            if (err) {
                res.status(500).json({
                    status: 0,
                    error: err
                });
                return false;
            }

            res.send({
                status: 1
            });
        });
    });


    router.post('/post/delete/:id', auth_user, function (req, res, next) {
        var id = validator.trim(xss(req.params.id));
        Post.deletePost(id, function (err) {
            if (err) {
                res.status(500).json({
                    status: 0,
                    error: err
                });
                return false;
            }
            res.json({
                status: 1
            });
        });
    });


    router.post('/post/new', auth_user, function (req, res, next) {
        if (! req.body.post || ! req.body.title || ! req.body.categories) {
            errorHandling(req, res, { error: '请完善文章信息。', type: 401});
            return false;
        }        
        var now = new Date();
        var title = validator.trim(xss(req.body.title));
        var author = req.session.user.uid;
        var avatar = req.session.user.avatar;
        var date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
        var post = req.body.post;
        var published = validator.trim(xss(req.body.publish));
        published = published === 'false' ? false : (published === 'true' ? true : undefined);
        if (published === undefined) {
            res.send({
                status: 0,
                id: 0
            });
            return;
        }
        var tags;
        if (Object.prototype.toString.call(req.body.tags) === '[object Array]') {
            tags  =[];
            req.body.tags.forEach(function (tag) {
                tags.push(validator.trim(xss(tag)));
            });
        } else if (Object.prototype.toString.call(req.body.tags) === '[object String]') {
            tags = validator.trim(xss(req.body.tags));
        }
        var category = validator.trim(xss(req.body.categories));

        Post.createNewPost({
            title: title, 
            author: author, 
            authorAvatar: avatar,
            date: date, 
            tags:tags, 
            post: post, 
            published: published,
            category: category
        }, function (err, p) {
            if (err) {
                res.status(500).json({
                    status: 0,
                    error: err
                });
                return false;
            }
            res.send({
                status: 1,
                id: p._id
            });
        });
    });



    router.post('/category/new', auth_user, function (req, res, next) {
        if (! req.body.name) {
            errorHandling(req, res, { error: '请输入分类名称。', type: 401});
            return false;
        }
        var name = validator.trim(xss(req.body.name));

        Category.getOneByName(name, function (err, c) {
            if (err) {
                errorHandling(req, res, { error: err, type: 500});
                return false;
            }
            if (! c) {
                Category.createNew(name, function (err) {
                    if (err) res.send(err);
                    res.redirect(adminPath+'/post');
                });
            } else {
                errorHandling(req, res, { error: '该分类已存在。', type: 500});
                return false;
            }
        });
    });

    router.post('/category/edit/:id', auth_user, function (req, res, next) {
        if (! req.body.name) {
            errorHandling(req, res, { error: '请输入分类名称。', type: 401});
            return false;
        }
        var id = validator.trim(xss(req.params.id));
        var name = validator.trim(xss(req.body.name));

        Category.getOneByName(name, function (err, c) {
            if (err) {
                errorHandling(req, res, { error: err, type: 500});
                return false;
            }
            if (c) {
                Category.update(id, name, function (err) {
                    if (err) {
                        errorHandling(req, res, { error: err, type: 500});
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
                errorHandling(req, res, { error: err, type: 500});
                return false;
            }
            if (c) {
                if (c.count > 0) {
                    errorHandling(req, res, {error: '该分类下面仍然有文章。删除前请确保分类已经没有文章。', type: 500});
                    return false;
                } else {
                    Category.delete(id, function (err) {
                        if (err) {
                            errorHandling(req, res, { error: err, type: 500});
                            return false;
                        }
                        res.redirect(adminPath+'/post');
                    });
                }
            }
        });
    });
};

function isMobile (req) {
    var mobileUA = ['Android','iPhone','iPad','Windows Phone'];
    var UAheader = req.headers['user-agent'];
    var result = false;
    mobileUA.forEach(function (u, index) {
        var reg = new RegExp(u, 'gi');
        if (reg.test(UAheader)) {
            result = true;
        }
    });
    return result;
}