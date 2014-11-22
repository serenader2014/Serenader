var Promise = require('bluebird'),
    validator = require('validator'),
    markdown = require('marked'),
    log = require('../../utils/log')(),
    config = require('../../../../config').config,
    url = config.url,
    amount = config.api.amountPerRequest,
    Post = require('../../models').Post,
    Category = require('../../models').Category;

function getAllPosts (amount, page, user) {
    return user && user.role === 'admin' ? Post.getAllPosts(amount, page) : Post.getPublishedPosts(amount, page);    
}

function getUserPosts (amount, page, user, targetUser) {
    return user && ((user.uid === targetUser) || user.role === 'admin')? 
        Post.getUserAllPosts(targetUser, amount, page) :
        Post.getUserPublishedPosts(targetUser, amount, page);
}

function getPost (id, user) {
    return Post.getPostById(id).then(function (post) {
        if (post.published || (user && user.role === 'admin') || (user && user.uid === post.author)) {
            return post;
        } else {
            return {};
        }
    });
}

function checkRequestBody (req) {
    return new Promise(function (resolve, reject) {
        var now, title, author, date, md, html, category, published, tags, slug, user;
        user = req.session.user;
        if (!user) {
            reject({stack: '',message:'权限不足。'});
            return false;
        }
        if (!req.body.content || !req.body.title || !req.body.category || !req.body.slug) {
            reject({message:'请完善文章信息。', stack: ''});
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
        author = user.uid;
        md = validator.trim(req.body.content);
        category = validator.trim(req.body.category);
        published = validator.trim(req.body.publish);
        published = published === 'false' ? false : (published === 'true' ? true : undefined);
        if (published === undefined) {
            reject({message: 'published键值为空。', stack: ''});
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
            reject({message:'标签必须为数组。',stack:''});
            return false;
        }

        try {
            html = markdown(md);
        } catch (err) {
            reject({message: 'Markdown 解析错误。', stack: ''});
            return false;
        }
        resolve({
            author: author,
            title: title,
            markdown: md,
            html: html,
            date: date,
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
        var page;
        page = req.query.page || 1;
        getAllPosts(amount, page, req.session.user).then(function (posts) {
            res.json(posts);
        }).then(null, function (err) {
            log.error(err.stack);
            res.json({error: err.message});
        });
    });

    router.get(url.user + '/:user/' + url.post, function (req, res) {
        var targetUser,
            page;
        page = req.query.page || 1;
        targetUser = validator.trim(req.params.user);
        getUserPosts(amount, page, req.session.user, targetUser).then(function (posts) {
            res.json(posts);
        }).then(null, function (err) {
            log.error(err.stack);
            res.json({error: err.message});
        });
    });

    router.get(url.post + '/:id', function (req, res) {
        var id;
        id = validator.trim(req.params.id);

        getPost(id).then(function (post) {
            res.json(post);
        }).then(null, function (err) {
            log.error(err.stack);
            res.json({error: err.message});
        });
    });

    router.put(url.post + '/:id', function (req, res) {
        var id = validator.trim(req.params.id);
        checkRequestBody(req).then(function (result) {
            function checkAuthor () {
                return new Promise(function (resolve, reject) {
                    Post.getPostById(id).then(function (post) {
                        if (post.author === result.author || result.user.role === 'admin') {
                            resolve();
                        } else {
                            reject({message:'权限不足。', stack: ''});
                        }
                    }).then(null, function (err) {
                        log.error(err.stack);
                        reject(err);
                    });
                });
            }
            return checkAuthor().then(function () {
                function checkCategory () {
                    return new Promise(function (resolve, reject) {
                        Category.getOneByName(result.category).then(function (c) {
                            if (c) {
                                resolve();
                            } else {
                                reject({message:'找不到分类。', stack: ''});
                            }
                        }).then(null, function (err) {
                            log.error(err.stack);
                            reject(err);
                        });
                    });
                }
                return checkCategory().then(function () {
                    return Post.update({
                        id: id,
                        title: result.title,
                        slug: result.slug,
                        author: result.author,
                        markdown: result.markdown,
                        html: result.html,
                        lastModifiedDate: result.date,
                        tags: result.tags,
                        published: result.published,
                        category: result.category
                    });
                }).then(function () {
                    res.json({ret: 0});
                });
            });
        }).catch(function (err) {
            res.json({ret: -1,error: err.message});
        });
    });


    router.delete(url.post + '/:id', function (req, res) {
        var id = validator.trim(req.params.id),
            user = req.session.user;
        if (!user) {
            res.json({
                ret: -1,
                error: '权限不足。'
            });
            return false;
        }
        function checkAuthor () {
            return new Promise(function (resolve, reject) {
                Post.getPostById(id).then(function (post) {
                    if (post.author === user.uid || user.role === 'admin') {
                        resolve();
                    } else {
                        reject({message: '权限不足。', stack: ''});
                    }
                }).then(null, function (err) {
                    log.error(err.stack);
                    reject(err);
                });
            });
        }
        checkAuthor().then(function () {
            return Post.delete(id).then(function () {
                res.json({
                    ret: 0
                });
            });
        }).catch(function (err) {
            res.json({
                ret: -1,
                error: err.message
            });
            return false;
        });
    });

    router.post(url.newPost, function (req, res) {
        checkRequestBody(req).then(function (post) {
            function checkCategory () {
                return new Promise(function (resolve, reject) {
                    Category.getOneByName(post.category).then(function (c) {
                        if (c) {
                            resolve();
                        } else {
                            reject({message: '找不到分类。', stack: ''});
                        }
                    }).then(null, function (err) {
                        log.error(err.stack);
                        reject(err);
                    });
                });
            }
            return checkCategory().then(function () {
                return Post.create({
                    title: post.title, 
                    slug: post.slug,
                    author: post.author, 
                    createDate: post.date, 
                    lastModifiedDate: post.date,
                    tags: post.tags, 
                    markdown: post.md,
                    html: post.html, 
                    published: post.published,
                    category: post.category
                }).then(function (p) {
                    if (post.published) {
                        return Category.increaseCount(post.category).then(function () {
                            return p;
                        });
                    } else {
                        return p;
                    }
                });
            });
        }).then(function (post) {
            res.json({ret: 0, id: post.id});
        }).then(null, function (err) {
            res.json({ret: -1, error: err.message});
        });
    });
};

module.exports.utils = {
    getPost: getPost,
    getAllPosts: getAllPosts,
    getUserPosts: getUserPosts
};