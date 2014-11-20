var validator = require('validator'),
    markdown = require('marked'),
    _ = require('underscore'),
    auth_user = require('../../utils/auth_user'),
    Post = require('../../models').Post,
    Category = require('../../models').Category,
    url = require('../../../../config').config.url,
    errorHandling = require('../../utils/error'),
    log = require('../../utils/log')();


module.exports = function (router) {

    router.get(url.adminPost, auth_user, function (req, res) {
        function isAdmin () {
            if (req.session.user.role === 'admin') {
                return Post.getAllPosts();
            } else {
                return  Post.getUserPosts(req.session.user.uid);
            }
        }

        isAdmin().then(function (posts) {
            Category.getAll().then(function (categories) {
                var drafts = _.filter(posts, {published: false}),
                    p = _.filter(posts, {published: true});
                res.render('post_list', {
                    posts: p,
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

    router.get(url.adminNewPost, auth_user, function (req, res) {
        Category.getAll().then(function (c) {
            res.render('post', {categories: c});
        }).then(null, function (err) {
            log.error(err.stack);
            errorHandling(req, res, { error: err.message, type: 404 });
        });
    });

    router.get(url.adminPost + '/:id', auth_user, function (req, res) {
        var id = validator.trim(req.params.id);

        Post.getOnePostById(id).then(function (p) {
            if (req.session.user.role !== 'admin' && p.author !== req.session.user.uid) {
                res.redirect(url.admin+'/post');
                return false;
            }
            Category.getAll().then(function (c) {
                res.render('post', {
                    categories: c, 
                    post: p
                });
            }).then(null, function (err) {
                log.error(err.stack);
                errorHandling(req, res, { error: err.message, type: 404 });
            });
        }).then(null, function (err) {
            log.error(err.stack);
            errorHandling(req, res, { error: err.message, type: 404});
        }); 
    });

    router.put(url.adminPost + '/:id', auth_user, function (req, res) {
        var now, title, author, date, md, html, category, id, published, tags, slug;
        if (!req.body.content || !req.body.title || !req.body.category || !req.body.slug) {
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
        title = validator.trim(req.body.title);
        slug = validator.trim(req.body.slug);
        author = req.session.user.uid;
        md = validator.trim(req.body.content);
        category = validator.trim(req.body.category);
        id = validator.trim(req.params.id);
        published = validator.trim(req.body.publish);
        published = published === 'false' ? false : (published === 'true' ? true : undefined);
        if (published === undefined) {
            res.json({
                status: 0,
                id: 0
            });
            return false;
        }        
        if (Array.isArray(req.body.tags)) {
            tags = [];
            req.body.tags.forEach(function (tag) {
                tags.push(validator.trim(tag));
            });
        } else if (! req.body.tags) {
            tags = [];
        } else {
            res.json({
                status: 0,
                error: 'tags must be an array'
            });
            return false;
        }


        try {
            html = markdown(md);
        } catch (err) {
            res.json({
                status: 0,
                error: 'Compile markdown error.'
            });
            return false;
        }
        Category.getOneByName(category).then(function (c) {
            if (c) {
                return Post.updatePost({
                    id: id,
                    title: title,
                    slug: slug,
                    author: author,
                    markdown: md,
                    html: html,
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


    router.delete(url.adminPost + '/:id', auth_user, function (req, res) {
        var id = validator.trim(req.params.id);
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


    router.post(url.adminNewPost, auth_user, function (req, res) {
        var now, title, author, date, md, html, published, tags, category, slug;
        if (! req.body.content || ! req.body.title || ! req.body.category || ! req.body.slug) {
            res.json({
                status: 0,
                error: '请完善文章信息。'
            });
            return false;
        }
        now = new Date();
        title = validator.trim(req.body.title);
        slug = validator.trim(req.body.slug);
        author = req.session.user.uid;
        date = {
            year: now.getFullYear(), 
            month: now.getMonth() + 1, 
            day: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds()
        };
        md = validator.trim(req.body.content);
        category = validator.trim(req.body.category);
        published = validator.trim(req.body.publish);
        published = published === 'false' ? false : (published === 'true' ? true : undefined);
        if (published === undefined) {
            res.json({
                status: 0,
                id: 0
            });
            return false;
        }
        if (Array.isArray(req.body.tags)) {
            tags = [];
            req.body.tags.forEach(function (tag) {
                tags.push(validator.trim(tag));
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

        try {
            html = markdown(md);
        } catch (err) {
            res.json({
                status: 0,
                error: 'Compile markdown error'
            });
            return false;
        }

        Category.getOneByName(category).then(function (c) {
            if (c) {
                return Post.createNewPost({
                    title: title, 
                    slug: slug,
                    author: author, 
                    createDate: date, 
                    lastModifiedDate: date,
                    tags:tags, 
                    markdown: md,
                    html: html, 
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

    router.post(url.adminNewCategory, auth_user, function (req, res) {
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
        name = validator.trim(req.body.name);

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

    router.put(url.adminCategory + '/:id', auth_user, function (req, res) {
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
        id = validator.trim(req.params.id);
        name = validator.trim(req.body.name);

        Category.getOneById(id).then(function (c) {
            if (c) {
                return Category.update(id, name).then(function () {
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

    router.delete(url.adminCategory + '/:id', auth_user, function (req, res) {
        var id = validator.trim(req.params.id);
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