var Promise = require('bluebird'),
    validator = require('validator'),
    log = require('../../utils/log')(),
    config = require('../../../../config').config,
    url = config.url,
    Post = require('../../models').Post,
    Category = require('../../models').Category;

function checkExist (options) {
    var type = options.type,
        value = options.value;
    return new Promise(function (resolve, reject) {
        Promise.resolve().then(function () {
            if (type === 'id') {
                return Category.getOneById(value);
            } else if (type === 'name') {
                return Category.getOneByName(value);
            }
        }).then(function (c) {
            if (c) {
                resolve(c);
            } else {
                reject('找不到该分类。');
            }
        }).catch(function (err) {
            log.error(err.stack);
            reject(err);
        });
    });
}


module.exports = function (router) {
    router.get(url.category, function (req, res) {
        Category.getAll().then(function (categories) {
            res.json(categories);
        });
    });

    router.post(url.category, function (req, res) {
        var name;
        if (!req.session.user || req.session.user.role !== 'admin') {
            res.json({ret: -1,error: '无法创建新的分类，权限不足！'});
            return false;
        }
        if (! req.body.name) {
            res.json({ret: -1,error: '分类名为空。'});
            return false;
        }

        name = validator.trim(req.body.name);

        checkExist({type: 'name', value: name}).then(function () {
            res.json({ret: -1, error: '该分类已存在。'});
        }).catch(function (err) {
            if (typeof err === 'string') {
                return Category.create(name).then(function (category) {
                    res.json({ret: 0, id: category.id});
                });
            } else {
                log.error(err.stack);
                res.json({ret: -1, error: err.message});
            }
        });
    });

    router.put(url.category + '/:id', function (req, res) {
        var id, name;
        if (!req.session.user || req.session.user.role !== 'admin') {
            res.json({
                ret: -1,
                error: '无法修改分类名称，权限不足！'
            });
            return false;
        }
        if (! req.body.name) {
            res.json({
                ret: -1,
                error: '分类名为空。'
            });
            return false;
        }
        id = validator.trim(req.params.id);
        name = validator.trim(req.body.name);

        checkExist({type: 'id', value: id}).then(function (category) {
            return Category.update(id, name).then(function () {
                return Post.adjustCategory(category.name, name);
            });
        }).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            res.json({ret: -1, error: err.message || err});
        });
    });

    router.delete(url.category + '/:id', function (req, res) {
        var id = validator.trim(req.params.id);
        if (!req.session.user || req.session.user.role !== 'admin') {
            res.json({
                ret: -1,
                error: '无法删除分类，权限不足！'
            });
            return false;
        }
        function checkEmpty () {
            return new Promise(function (resolve, reject) {
                Category.getOneById(id).then(function (category) {
                    if (category.count > 0) {
                        reject('该分类下面仍然有文章。删除前请确保分类已经没有文章。');
                    } else {
                        resolve();
                    }
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        checkEmpty().then(function () {
            return Category.delete(id);
        }).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            log.error(err.stack);
            res.json({ret: -1, error: err.message || err});
        });
    });
};