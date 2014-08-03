var xss = require('xss');
var validator = require('validator');

var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Post = require('../../proxy').post;
var Draft = require('../../proxy').draft;
var Category = require('../../proxy').category;
var errorHandling = require('../../routes').error;


module.exports = function (router) {

    router.get('/post', auth_user, function (req, res, next) {
        Draft.getUserDrafts(req.session.user.uid, function (err, drafts) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            Post.getUserTenPosts(req.session.user.uid, function (err, posts) {
                if (! err && posts) {
                    Category.getAll(function (err, c) {
                        if (! err && c) {
                            res.render('admin_post_content', {
                                adminPath: adminPath, 
                                locals: res.locals, 
                                posts: posts,
                                drafts: drafts,
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
        });
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
        if (! req.body.post || ! req.body.title || ! req.body.categories) {
            errorHandling(res, { error: '请完善文章信息。', type: 401});
            return false;
        }
        var now = new Date();
        var title = validator.trim(xss(req.body.title));
        var author = req.session.user.uid;
        var date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
        var post = validator.trim(xss(req.body.post));
        var category = validator.trim(xss(req.body.categories));
        var id = validator.trim(xss(req.params.id));
        var draftId = validator.trim(xss(req.body.draftid));
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
            date: date,
            post: post,
            tags: tags,
            category: category
        }, function (err) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            Draft.deleteDraft(draftId, function (err) {
                if (err) {
                    errorHandling(res, { error: err, type: 500});
                    return false;
                }
                res.redirect(adminPath+'/post');
            });
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


    router.post('/post/draft/new', auth_user, function (req, res, next) {
        var now = new Date();
        var title = req.body.title ? validator.trim(xss(req.body.title)) : '';
        var author = req.session.user.uid;
        var date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
        var post = req.body.post ? req.body.post : '';
        var tags;
        if (Object.prototype.toString.call(req.body.tags) === '[object Array]') {
            tags  =[];
            req.body.tags.forEach(function (tag) {
                tags.push(validator.trim(xss(tag)));
            });
        } else if (Object.prototype.toString.call(req.body.tags) === '[object String]') {
            tags = validator.trim(xss(req.body.tags));
        } else {
            tags = '';
        }
        var category = req.body.categories ? validator.trim(xss(req.body.categories)) : '';
        var originalId = req.body.originalId ? validator.trim(xss(req.body.originalId)) : '';
        var obj = {
            title: title,
            author: author,
            date: date,
            post: post,
            tags: tags,
            category: category,
            originalId: originalId
        };
        Draft.createDraft(obj, function (err, d) {
            res.send({
                code: err ? 0 : 1,
                id: d._id
            });
        });      
    });

    router.get('/post/draft/:id', auth_user, function (req, res, next) {
        var id = req.params.id;

        Draft.getOneDraftById(id, function (err, d) {
            if (! err && d) {
                if (d.author !== req.session.user.uid) {
                    res.redirect(adminPath+'/post');
                    return false;
                }
                Category.getAll(function (err, c) {
                    if (! err && c) {
                        res.render('admin_edit_draft', {adminPath: adminPath, locals: res.locals, categories: c, post: d});
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

    router.post('/post/draft/:id', auth_user, function (req, res, next) {
        var id = validator.trim(xss(req.params.id));
        var now = new Date();
        var title = req.body.title ? validator.trim(xss(req.body.title)) : 'No title';
        var author = req.session.user.uid;
        var date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
        var post = req.body.post ? req.body.post : '';
        var tags;
        if (Object.prototype.toString.call(req.body.tags) === '[object Array]') {
            tags  =[];
            req.body.tags.forEach(function (tag) {
                tags.push(validator.trim(xss(tag)));
            });
        } else if (Object.prototype.toString.call(req.body.tags) === '[object String]') {
            tags = validator.trim(xss(req.body.tags));
        } else {
            tags = '';
        }
        var category = req.body.categories ? validator.trim(xss(req.body.categories)) : '';
        var obj = {
            id: id,
            title: title,
            author: author,
            date: date,
            post: post,
            tags: tags,
            category: category
        };
        Draft.updateDraft(obj, function (err, d) {
            res.send({
                code: err ? 0 : 1
            });
        });
    });

    router.post('/post/new', auth_user, function (req, res, next) {
        if (! req.body.post || ! req.body.title || ! req.body.categories) {
            errorHandling(res, { error: '请完善文章信息。', type: 401});
            return false;
        }        
        var now = new Date();
        var title = validator.trim(xss(req.body.title));
        var author = req.session.user.uid;
        var date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
        var post = req.body.post;
        var draftId = validator.trim(xss(req.body.draftid));
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
            date: date, 
            tags:tags, 
            post: post, 
            category: category
        }, function (err) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            Draft.deleteDraft(draftId, function (err) {
                if (err) {
                    errorHandling(res, { error: err, type: 500});
                    return false;
                }
                res.redirect(adminPath+'/post');
            });
        });
    });



    router.post('/category/new', auth_user, function (req, res, next) {
        if (! req.body.name) {
            errorHandling(res, { error: '请输入分类名称。', type: 401});
            return false;
        }
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
        if (! req.body.name) {
            errorHandling(res, { error: '请输入分类名称。', type: 401});
            return false;
        }
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