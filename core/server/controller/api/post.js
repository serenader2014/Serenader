var Promise = require('bluebird'),
validator   = require('validator'),
markdown    = require('marked'),
moment      = require('moment'),
log         = require('../../utils/log')(),
config      = require('../../../../config').config,
url         = config.url,
amount      = require('../../index').locals.setting.postsPerPage,
Post        = require('../../models').Post,
Category    = require('../../models').Category;

function getPosts (options) {
    if (options.currentUser) {
        return Post.getPosts({
            author: options.targetUser,
            category: options.category
        }, options.amount, options.page);
    } else {
        return Post.getPosts({
            author: options.targetUser,
            category: options.category,
            published: true
        }, options.amount, options.page);
    }
}

function getPost (id, user) {
    return Post.getPostById(id).then(function (post) {
        if ((post && post.published) || (user && user.role === 'admin') || (user && user.uid === post.author)) {
            return post;
        } else {
            return {};
        }
    });
}

function checkOwner (options, user) {
    var type = options.type,
        value = options.value;
    return new Promise(function (resolve, reject) {
        Promise.resolve().then(function () {
            if (type === 'id') {
                return Post.getPostById(value);
            } else if (type === 'slug') {
                return Post.getPostBySlug(value);
            }
        }).then(function (post) {
            if (post.author === user.uid || user.role === 'admin') {
                resolve(post);
            } else {
                reject('权限不足。');
            }
        }).catch(function (err) {
            log.error(err.stack);
            reject(err);
        });
    });
}

function checkCategoryIsExist (id) {
    return new Promise(function (resolve, reject) {
        Category.getOneById(id).then(function (c) {
            if (c) {
                resolve(c);
            } else {
                reject('找不到分类。');
            }
        }).catch(function (err) {
            log.error(err.stack);
            reject(err);
        });
    });
}

function checkRequestBody (req) {
    return new Promise(function (resolve, reject) {
        var title, author, date, md, html, category, published, tags, slug, user, createDate;
        user = req.session.user;
        if (!user) {
            reject('权限不足。');
            return false;
        }
        if (!req.body.content || !req.body.title || !req.body.category || !req.body.slug) {
            reject('请完善文章信息。');
            return false;
        }
        date = moment.utc().format();
        title = validator.trim(req.body.title);
        slug = validator.trim(req.body.slug);
        author = user.uid;
        md = validator.trim(req.body.content);
        createDate = moment.utc(validator.trim(req.body.createDate)).format();
        category = validator.trim(req.body.category);
        published = validator.trim(req.body.publish);
        published = published === 'false' ? false : (published === 'true' ? true : undefined);
        if (published === undefined) {
            reject('published键值为空。');
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
            reject('标签必须为数组。');
            return false;
        }

        try {
            html = markdown(md);
        } catch (err) {
            reject('Markdown 解析错误。');
            return false;
        }
        resolve({
            author: author,
            title: title,
            markdown: md,
            html: html,
            date: date,
            createDate: createDate,
            tags: tags,
            published: published,
            slug: slug,
            category: category,
            user: user
        });
    });
}



module.exports = function (router) {
    router.get(url.post, function (req, res) {
        var page, user, category, customAmount;
        page = +req.query.page || 1;
        user = req.query.user;
        category = decodeURIComponent(req.query.category);
        customAmount = +req.query.amount;
        getPosts({
            amount: customAmount || amount,
            page: page,
            currentUser: req.session.user,
            targetUser: user,
            category: category
        }).then(function (posts) {
            res.json({ret: 0, data: posts});
        }).catch(function (err) {
            log.error(err.stack || err);
            res.json({ret: -1, error: err.message || err});
        });
    });

    router.get(url.post + '/:id', function (req, res) {
        var id;
        id = validator.trim(req.params.id);

        getPost(id, req.session.user).then(function (post) {
            res.json({ret: 0, data: post});
        }).catch(function (err) {
            log.error(err.stack || err);
            res.json({ret: -1, error: err.message || err});
        });
    });

    router.put(url.post + '/:id', function (req, res) {
        var id = validator.trim(req.params.id);
        checkRequestBody(req).then(function (result) {
            return checkOwner({type: 'id', value: id}, req.session.user).then(function (post) {
                return checkCategoryIsExist(post.category).then(function () {
                    return Post.update({
                        id: id,
                        title: result.title,
                        slug: result.slug,
                        author: result.author,
                        markdown: result.markdown,
                        html: result.html,
                        createDate: new Date(result.createDate),
                        lastModifiedDate: new Date(result.date),
                        tags: result.tags,
                        published: result.published,
                        category: result.category
                    });
                });
            });
        }).then(function () {
            res.json({ret: 0, data: {id: id}});
        }).catch(function (err) {
            res.json({ret: -1,error: err.message || err});
        });
    });


    router.delete(url.post + '/:id', function (req, res) {
        var id = validator.trim(req.params.id),
            user = req.session.user;
        if (!user) {
            res.json({ret: -1,error: '权限不足。'});
            return false;
        }

        checkOwner({type: 'id', value: id}, req.session.user).then(function () {
            return Post.delete(id);
        }).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            res.json({ret: -1, error: err.message || err});
            return false;
        });
    });

    router.post(url.post, function (req, res) {
        checkRequestBody(req).then(function (post) {
            return checkCategoryIsExist(post.category).then(function () {
                return Post.create({
                    title: post.title,
                    slug: post.slug,
                    author: post.author,
                    createDate: new Date(post.createDate),
                    lastModifiedDate: new Date(post.createDate),
                    tags: post.tags,
                    markdown: post.markdown,
                    html: post.html,
                    published: post.published,
                    category: post.category
                });
            });
        }).then(function (p) {
            return Promise.resolve().then(function () {
                if (p.published) {
                    return Category.increaseCount(p.category);
                }
            }).then(function () {
                return p;
            });
        }).then(function (post) {
            res.json({ret: 0, data: {id: post._id}});
        }).catch(function (err) {
            res.json({ret: -1, error: err.message || err});
        });
    });
};

module.exports.utils = {
    getPost: getPost
};