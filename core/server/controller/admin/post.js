var xss = require('xss'),
    validator = require('validator'),
    auth_user = require('../../utils/auth_user'),
    Post = require('../../models').Post,
    Category = require('../../models').Category,
    url = require('../../../../config').config.url,
    errorHandling = require('../../utils/error');


module.exports = function (router) {

    router.get(url.adminPost, auth_user, function (req, res, next) {
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

    router.get(url.adminNewPost, auth_user, function (req, res, next) {
        Category.getAll(function (err, c) {
            if (! err && c) {
                if (isMobile(req)) {
                    res.render('admin_new_post_mobile', {categories: c});
                } else {
                    res.render('admin_new_post', {categories: c});
                }
            } else {
                errorHandling(req, res, { error: err ? err : 'No category was found.', type: 404});
                return false;
            }
        });
    });

    router.get(url.adminEditPost + '/:id', auth_user, function (req, res, next) {
        var id = req.params.id;

        Post.getOnePostById(id, function (err, p) {
            if (! err && p) {
                if (req.session.user.role !== 'admin' && p.author !== req.session.user.uid) {
                    res.redirect(url.admin+'/post');
                    return false;
                }
                Category.getAll(function (err, c) {
                    if (! err && c) {
                        if (isMobile(req)) {
                            res.render('admin_edit_post_mobile', {
                                categories: c, 
                                post: p
                            });
                        } else {
                            res.render('admin_edit_post', {
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

    router.post(url.adminEditPost + '/:id', auth_user, function (req, res, next) {
        var now, title, author, avatar, date, post, category, id, published, tags;
        if (! req.body.post || ! req.body.title || ! req.body.categories) {
            res.json({
                status: 0,
                error: '请完善文章信息。'
            });
            return false;
        }
        title = validator.trim(xss(req.body.title));
        author = req.session.user.uid;
        avatar = req.session.user.avatar;
        post = validator.trim(xss(req.body.post));
        category = validator.trim(xss(req.body.categories));
        id = validator.trim(xss(req.params.id));
        published = validator.trim(xss(req.body.publish));
        published = published === 'false' ? false : (published === 'true' ? true : undefined);
        if (published === undefined) {
            res.send({
                status: 0,
                id: 0
            });
            return;
        }        
        if (Array.isArray(req.body.tags)) {
            tags  =[];
            req.body.tags.forEach(function (tag) {
                tags.push(validator.trim(xss(tag)));
            });
        } else if (typeof req.body.tags === 'string') {
            tags = validator.trim(xss(req.body.tags));
        }

        Post.updatePost({
            id: id,
            title: title,
            author: author,
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


    router.post(url.adminDeletePost + '/:id', auth_user, function (req, res, next) {
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


    router.post(url.adminNewPost, auth_user, function (req, res, next) {
        var now, title, author, avatar, date, post, published, tags, category;
        if (! req.body.post || ! req.body.title || ! req.body.categories) {
            errorHandling(req, res, { error: '请完善文章信息。', type: 401});
            return false;
        }        
        now = new Date();
        title = validator.trim(xss(req.body.title));
        author = req.session.user.uid;
        date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
        post = req.body.post;
        published = validator.trim(xss(req.body.publish));
        published = published === 'false' ? false : (published === 'true' ? true : undefined);
        if (published === undefined) {
            res.send({
                status: 0,
                id: 0
            });
            return;
        }
        if (Array.isArray(req.body.tags)) {
            tags  =[];
            req.body.tags.forEach(function (tag) {
                tags.push(validator.trim(xss(tag)));
            });
        } else if (typeof req.body.tags === 'string') {
            tags = validator.trim(xss(req.body.tags));
        }
        category = validator.trim(xss(req.body.categories));

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



    router.post(url.adminNewCategory, auth_user, function (req, res, next) {
        var name;
        if (! req.body.name) {
            res.json({
                status: 0,
                error: ''
            });
            return false;
        }
        name = validator.trim(xss(req.body.name));

        Category.getOneByName(name, function (err, c) {
            if (err) {
                res.json({
                    status: 0,
                    error: err
                });
                return false;
            }
            if (! c) {
                Category.createNew(name, function (err) {
                    if (err) {
                        res.json({
                            status: 0,
                            error: err
                        });
                        return false;
                    }
                    res.json({
                        status: 1,
                        error: ''
                    });
                });
            } else {
                res.json({
                    status: 0,
                    error: '该分类已存在。'
                });
                return false;
            }
        });
    });

    router.post(url.adminEditCategory + '/:id', auth_user, function (req, res, next) {
        var id, name;
        if (! req.body.name) {
            res.json({
                status: 0,
                error: '请输入分类名称。'
            });
            return false;
        }
        id = validator.trim(xss(req.params.id));
        name = validator.trim(xss(req.body.name));

        Category.getOneById(id, function (err, c) {
            if (err) {
                res.json({
                    status: 0,
                    error: err
                });
                return false;
            }
            if (c) {
                Category.update(id, name, function (err) {
                    if (err) {
                        res.json({
                            status: 0,
                            error: err
                        });
                        return false;
                    }
                    res.json({
                        status: 1,
                        error: ''
                    });
                });
            } else {
                res.json({
                    status: 0,
                    error: '找不到该分类。'
                });
            }
        });
    });

    router.post(url.adminDeleteCategory + '/:id', auth_user, function (req, res, next) {
        var id = validator.trim(xss(req.params.id));
        Category.getOneById(id, function (err, c) {
            if (err) {
                res.json({
                    status: 0,
                    error: err
                });
                return false;
            }
            if (c) {
                if (c.count > 0) {
                    res.json({
                        status: 0,
                        error: '该分类下面仍然有文章。删除前请确保分类已经没有文章。'
                    });
                    return false;
                } else {
                    Category.delete(id, function (err) {
                        if (err) {
                            res.json({
                                status: 0,
                                error: err
                            });
                            return false;
                        }
                        res.json({
                            status: 1,
                            error: ''
                        });
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