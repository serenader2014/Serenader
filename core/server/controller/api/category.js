var Promise = require('bluebird'),
    validator = require('validator'),
    log = require('../../utils/log')(),
    config = require('../../../../config').config,
    url = config.url,
    Post = require('../../models').Post,
    Category = require('../../models').Category;


module.exports = function (router) {
    router.post(url.newCategory, function (req, res) {
        var name;
        if (!req.session.user || req.session.user.role !== 'admin') {
            res.json({
                ret: -1,
                error: '无法创建新的分类，权限不足！'
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

        name = validator.trim(req.body.name);

        function checkExist () {
            return new Promise(function (resolve, reject) {
                Category.getOneByName(name).then(function (category) {
                    if (category) {
                        reject({stack: '', message: '分类名已存在。'});
                    } else {
                        resolve();
                    }
                }).then(null, function (err) {
                    reject(err);
                });
            });
        }
        checkExist().then(function () {
            return Category.createNew(name).then(function (category) {
                res.json({ret: 0, id: category.id});
            });
        }).then(null, function (err) {
            log.error(err.stack);
            res.json({ret: -1, error: err.message});
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

        function checkExist () {
            return new Promise(function (resolve, reject) {
                Category.getOneById(id).then(function (c) {
                    if (c) {
                        resolve(c);
                    } else {
                        reject({stack:'', message: '找不到该分类。'});
                    }
                }).then(null, function (err) {
                    log.error(err.stack);
                    reject(err);
                });
            });
        }

        checkExist().then(function (category) {
            return Category.update(id, name).then(function () {
                return Post.adjustCategory(category.name, name);
            });
        }).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            res.json({ret: -1, error: err.message});
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
                        reject({stack: '', message: '该分类下面仍然有文章。删除前请确保分类已经没有文章。'});
                    } else {
                        resolve();
                    }
                }).then(null, function (err) {
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
            res.json({ret: -1, error: err.message});
        });
    });
};