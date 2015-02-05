var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    path = require('path'),
    _ = require('lodash'),
    validator = require('validator'),
    config = require('../../../../config').config,
    URL = config.url,
    log = require('../../utils/log')(),
    root = config.root_dir;

function parseUrl (targetUrl, userName) {
    if (!targetUrl) {
        return false;
    }
    var parsedArr, type, dir, dstDir, target;

    parsedArr = _.compact(targetUrl.split('/'));
    type = _.first(parsedArr);
    dir = _.drop(parsedArr);
    dstDir = dir.join('/');
    target = path.resolve(root, 'content', 'data', type, userName, 'upload', dstDir);
    return {
        type: type,
        path: dstDir,
        target: target
    };
}

function readDir (dir) {
    var files, folders;
    files  = [];
    folders = [];

    return fs.readdirAsync(dir).then(function (f) {
        return f.reduce(function (p, file) {
            return p.then(function () {
                return fs.statAsync(dir + '/' + file)
                    .then(function (stat) {
                    if (stat.isDirectory()) {
                        folders.push({
                            name: file,
                            createTime: stat.ctime,
                            lastModifiedTime: stat.mtime
                        });
                    } else {
                        files.push({
                            name: file,
                            size: stat.size,
                            createTime: stat.ctime,
                            lastModifiedTime: stat.mtime
                        });
                    }
                });
            });
        }, Promise.resolve()).then(function () {
            return {
                files: files,
                folders: folders
            };
        });
    });
}

function checkRequestBody (req) {
    return new Promise(function (resolve, reject) {
        if (!req.body.file) {
            reject('文件字段为空。');
            return false;
        }
        if (!req.body.target) {
            reject('目标字段为空。');
            return false;
        }
        var userName = req.session.user.uid,
            file = parseUrl(validator.trim(req.body.file), userName).target,
            parsed = parseUrl(validator.trim(req.body.target), userName);

        if (parsed.type !== 'public' && parsed.type !== 'private') {
            reject('类型错误。');
            return false;
        }
        resolve([file, parsed.target]);
    });
}

module.exports = function (router) {

    router.post(URL.newFile, function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }

        var fileName = validator.trim(req.body.name),
            type = validator.trim(req.body.type),
            dir = validator.trim(req.body.dir),
            userName = req.session.user.uid,
            targetPath = parseUrl(dir, userName).target,
            newFile = path.join(targetPath, fileName);

        (function () {
            if (type === 'file') {
                return fs.ensureFileAsync(newFile);
            } else if (type === 'folder') {
                return fs.ensureDirAsync(newFile);
            } else {
                Promise.reject('类型错误！');
            }
        })().then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            log.error(err);
            res.json({ret: -1, error: err});
        });
    });

    router.put(URL.fileEdit, function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        if (!req.body.dir) {
            res.json({ret: -1, error: '路径字段为空。'});
            return false;
        }
        var userName = req.session.user.uid,
            newContent = req.body.file,
            targetPath = parseUrl(validator.trim(req.body.dir), userName).target;
        fs.writeFileAsync(targetPath, newContent, { encoding: 'utf8'}).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            res.json({ret: -1,error: err.message});
        });
    });

    router.post(URL.fileList, function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        if (!req.body.dir) {
            res.json({ret: -1,error: '路径字段为空。'});
            return false;
        }
        var userName = req.session.user.uid,
            dstDir = parseUrl(validator.trim(req.body.dir), userName).target;
        readDir(dstDir).then(function (obj) {
            res.json({ret: 0, data: {files: obj.files, folders: obj.folders}});
        }).catch(function (err) {
            log.error(err.stack);
            res.json({ret: -1,error: err.message});
        });
    });

    router.post(URL.fileMove, function (req, res) {
        checkRequestBody(req).then(function (arr) {
            var file = arr[0],
                target = arr[1];
            fs.moveAsync(file, target).then(function () {
                res.json({ret: 0});
            }).catch(function (err) {
                log.error(err);
                res.json({ret: -1, error: err});
            });
        });
    });

    router.post(URL.fileCopy, function (req, res) {
        checkRequestBody(req).then(function (file, target) {
            fs.copyAsync(file, target).then(function () {
                res.json({ret: 0});
            }).catch(function (err) {
                log.error(err);
                res.json({ret: -1, error: err});
            });
        });
    });
};
