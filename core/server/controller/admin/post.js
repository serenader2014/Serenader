var Promise = require('bluebird'),
    xss = require('xss'),
    validator = require('validator'),
    auth_user = require('../../utils/auth_user'),
    Post = require('../../models').Post,
    Category = require('../../models').Category,
    url = require('../../../../config').config.url,
    errorHandling = require('../../utils/error'),
    log = require('../../utils/log')();


module.exports = function (router) {

    router.get(url.adminPost, auth_user, function (req, res, next) {
        Post.getUserPosts(req.session.user.uid).then(function (posts) {
            Category.getAll().then(function (categories) {
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
                    categories: categories
                });
            }).then(null, function (err) {
                log.error(err.stack);
                errorHandling(req, res, { error: err.message, type: 404 });
            });
        }).then(null, function (err) {
            log.error(err.stack);
            errorHandling(req, res, { error: err.message, type: 404 });
        });      
    });

    router.get(url.adminNewPost, auth_user, function (req, res, next) {
        Category.getAll().then(function (c) {
            if (isMobile(req)) {
                res.render('admin_new_post_mobile', {categories: c});
            } else {
                res.render('admin_new_post', {categories: c});
            }
        }).then(null, function (err) {
            log.error(err.stack);
            errorHandling(req, res, { error: err.message, type: 404 });
        });
    });

    router.get(url.adminEditPost + '/:id', auth_user, function (req, res, next) {
        var id = validator.trim(xss(req.params.id));

        Post.getOnePostById(id).then(function (p) {
            if (req.session.user.role !== 'admin' && p.author !== req.session.user.uid) {
                res.redirect(url.admin+'/post');
                return false;
            }
            Category.getAll().then(function (c) {
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
            }).then(null, function (err) {
                log.error(err.stack);
                errorHandling(req, res, { error: err.message, type: 404 });
            });
        }).then(null, function (err) {
            log.error(err.stack);
            errorHandling(req, res, { error: err.message, type: 404});
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
        now = new Date();
        date = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds()
        };
        title = validator.trim(xss(req.body.title));
        author = req.session.user.uid;
        avatar = req.session.user.avatar;
        post = validator.trim(xss(req.body.post));
        category = validator.trim(xss(req.body.categories));
        id = validator.trim(xss(req.params.id));
        published = validator.trim(xss(req.body.publish));
        published = published === 'false' ? false : (published === 'true' ? true : undefined);
        if (published === undefined) {
            res.json({
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
        } else if (! req.body.tags) {
            tags = [];
        } else {
            res.json({
                status: 0,
                error: 'tags must be an array'
            });
        }

        Category.getOneByName(category).then(function (c) {
            if (c) {
                return Post.updatePost({
                    id: id,
                    title: title,
                    author: author,
                    content: post,
                    lastModifiedDate: date,
                    tags: tags,
                    published: published,
                    category: category
                });
            } else {
                return false;
            }
        }).then(function (p) {
            if (p) {
                res.json({
                    status: 1
                });
            } else {
                res.json({
                    status: 0,
                    error: 'Category not found'
                });
            }
        }).then(null, function (err) {
            log.error(err.stack);
            res.status(500).json({
                status: 0,
                error: err.message
            });
        });
    });


    router.post(url.adminDeletePost + '/:id', auth_user, function (req, res, next) {
        var id = validator.trim(xss(req.params.id));
        Post.deletePost(id).then(function () {
            res.json({
                status: 1
            });
        }).then(null, function (err) {
            log.error(err.stack);
            res.status(500).json({
                status: 0,
                error: err.message
            });
        });
    });


    router.post(url.adminNewPost, auth_user, function (req, res, next) {
        var now, title, author, avatar, date, post, published, tags, category;
        if (! req.body.post || ! req.body.title || ! req.body.categories) {
            res.json({
                status: 0,
                error: '请完善文章信息。'
            });
            return false;
        }
        now = new Date();
        title = validator.trim(xss(req.body.title));
        author = req.session.user.uid;
        date = {
            year: now.getFullYear(), 
            month: now.getMonth() + 1, 
            day: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds()
        };
        post = req.body.post;
        published = validator.trim(xss(req.body.publish));
        published = published === 'false' ? false : (published === 'true' ? true : undefined);
        if (published === undefined) {
            res.json({
                status: 0,
                id: 0
            });
            return;
        }
        if (Array.isArray(req.body.tags)) {
            tags = [];
            req.body.tags.forEach(function (tag) {
                tags.push(validator.trim(xss(tag)));
            });
        } else if (!req.body.tags) {
            tags = [];
        } else {
            res.json({
                status: 0,
                error: 'tags must be an array'
            });
            return false;
        }
        category = validator.trim(xss(req.body.categories));

        Category.getOneByName(category).then(function (c) {
            if (c) {
                return Post.createNewPost({
                    title: title, 
                    author: author, 
                    createDate: date, 
                    lastModifiedDate: date,
                    tags:tags, 
                    content: post, 
                    published: published,
                    category: category
                }).then(function (p) {
                    if (published) {
                        return Category.increaseCount(category).then(function () {
                            return p;
                        });
                    } else {
                        return p;
                    }
                });
            } else {
                return null;
            }
        }).then(function (p) {
            if (p) {
                res.json({
                    status: 1,
                    id: p._id
                });
            } else {
                res.json({
                    status: 0,
                    error: 'Category not found'
                });
            }
        }).then(null, function (err) {
            log.error(err.stack);
            res.status(500).json({
                status: 0,
                error: err.message
            });
        });
    });

    router.post(url.adminNewCategory, auth_user, function (req, res, next) {
        var name;
        if (req.session.user.role !== 'admin') {
            res.json({
                status: 0,
                error: '无法创建新的分类，权限不足！'
            });
            return false;
        }
        if (! req.body.name) {
            res.json({
                status: 0,
                error: 'Category name not valid'
            });
            return false;
        }
        name = validator.trim(xss(req.body.name));

        Category.getOneByName(name).then(function (c) {
            if (! c) {
                return Category.createNew(name);
            } else {
                return false;
            }
        }).then(function (c) {
            if (c) {
                res.json({
                    status: 1
                });
            } else {
                res.json({
                    status: 0,
                    error: 'This category is already exist'
                });
            }
        }).then(null, function (err) {
            log.error(err.stack);
            res.json({
                status: 0,
                error: err.message
            });
        });
    });

    router.post(url.adminEditCategory + '/:id', auth_user, function (req, res, next) {
        var id, name;
        if (req.session.user.role !== 'admin') {
            res.json({
                status: 0,
                error: '无法修改分类名称，权限不足！'
            });
            return false;
        }        
        if (! req.body.name) {
            res.json({
                status: 0,
                error: '请输入分类名称。'
            });
            return false;
        }
        id = validator.trim(xss(req.params.id));
        name = validator.trim(xss(req.body.name));

        Category.getOneById(id).then(function (c) {
            if (c) {
                return Category.update(id, name).then(function (category) {
                    return c.name;
                });
            } else {
                return false;
            }
        }).then(function (category) {
            if (category) {
                Post.adjustCategory(category, name).then(function () {
                    res.json({
                        status: 1
                    });
                }).then(null, function (err) {
                    res.json({
                        status: 0,
                        error: err.message
                    });
                });
            } else {
                res.json({
                    status: 0,
                    error: 'can not found this category'
                });
            }
        }).then(null, function (err) {
            log.error(err.stack);
            res.json({
                status: 0,
                error: err.message
            });
        });
    });

    router.post(url.adminDeleteCategory + '/:id', auth_user, function (req, res, next) {
        var id = validator.trim(xss(req.params.id));
        if (req.session.user.role !== 'admin') {
            res.json({
                status: 0,
                error: '无法删除分类，权限不足！'
            });
            return false;
        }        
        Category.getOneById(id).then(function (c) {
            if (c.count > 0) {
                res.json({
                    status: 0,
                    error: '该分类下面仍然有文章。删除前请确保分类已经没有文章。'
                });
                return false;
            } else {
                Category.delete(id).then(function () {
                    res.json({
                        status: 1,
                        error: ''
                    });
                }).then(null, function (err) {
                    res.json({
                        status: 0,
                        error: err.message
                    });
                });
            }
        }).then(null, function (err) {
            log.error(err.stack);
            res.json({
                status: 0,
                error: err.message
            });
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