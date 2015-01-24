var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    path = require('path'),
    validator = require('validator'),
    config = require('../../../../config').config,
    URL = config.url,
    log = require('../../utils/log')(),
    root = config.root_dir + '/content/data/';



function realDir (type, username, lastPath) {
    return root + type + '/' + username + '/upload/' + lastPath;
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

function decodeURL (url) {
    // the url format:
    // /public/some/path/somefile.js
    // /private/some/path/somefile.js
    // output:
    // {middlePath: "some/path", basePath: "somefile.js", type: "private", fullPath: "some/path/somefile.js"}

    var tmpArr = url.split('/').slice(1),
        type = tmpArr.shift(),
        fullPath = tmpArr.join('/'),
        basePath = tmpArr.pop(),
        middlePath = tmpArr.join('/');

    return {
        middlePath: middlePath,
        basePath: basePath,
        type: type,
        fullPath: fullPath
    };
}

function checkRequestBody (req) {
    return new Promise(function (resolve, reject) {
        if (!req.body.files) {
            reject('文件字段为空。');
            return false;
        }
        if (!req.body.target) {
            reject('目标字段为空。');
            return false;
        }
        if (!Array.isArray(req.body.files) || typeof req.body.target !== 'string') {
            reject('文件字段或者目标字段格式错误。');
            return false;
        }
        var files = [],
            decodedPath = decodeURL(validator.trim(req.body.target)),
            userName = req.session.user.uid;

        if (decodedPath.type !== 'public' && decodedPath.type !== 'private') {
            reject('类型错误。');
            return false;
        }

        req.body.files.forEach(function (file) {
            if (file !== '') {
                var decoded = decodeURL(validator.trim(file)),
                    name = realDir(decoded.type, userName, decoded.fullPath);
                files.push(name);
            }
        });
        resolve(files);
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
            decodedPath = decodeURL(dir),
            userName = req.session.user.uid,
            targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath);

        if (type === 'file') {
            fs.writeFileAsync(targetPath + '/' + fileName).then(function () {
                res.json({ret: 0});
            }).catch(function (err) {
                res.json({ret: -1,error: err.message});
            });
        } else if (type === 'folder') {
            fs.mkdirsAsync(targetPath + '/' + fileName).then(function () {
                res.json({ret: 0,});
            }).catch(function (err) {
                res.json({ret: -1, error: err.message});
            });
        } else {
            res.json({ret: -1, error: '类别字段错误。'});
        }
    });

    router.post(URL.file, function (req, res) {
        // req.body.files format:
        // [{
        //     path: '/public/some/path',
        //     oldName: 'name.name',
        //     newName: 'new.name'
        // },
        // {
        //
        // }]
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        var userName = req.session.user.uid,
            files = req.body.files,
            previousFile = '',
            failedFile = [];

        if (!Array.isArray(files) || files.length === 0) {
            res.json({ret: -1, error: '字段格式错误。'});
            return false;
        }

        files.reduce(function (p, file) {
            return p.then(function () {
                if (file.path !== '' && file.oldName !== '' && file.newName !== '') {
                    var decodedPath = decodeURL(validator.trim(file.path)),
                        targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath),
                        oldName = validator.trim(file.oldName),
                        newName = validator.trim(file.newName);
                    if (decodedPath.type === 'public' || decodedPath.type === 'private') {
                        previousFile = oldName;
                        return fs.renameAsync(targetPath + '/' + oldName, targetPath + '/' + newName);
                    }
                }
            }).catch(function (err) {
                log.error(err.stack);
                failedFile.push({name: previousFile, error: err.message});
            });
        }, Promise.resolve()).then(function () {
            if (failedFile.length) {
                res.json({ret: 1, files: failedFile});
            } else {
                res.json({ret: 0,});
            }
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
            decodedPath = decodeURL(validator.trim(req.body.dir)),
            targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath);
        fs.writeFileAsync(targetPath, newContent, { encoding: 'utf8'}).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            res.json({ret: -1,error: err.message});
        });
    });

    router.delete(URL.file, function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        var userName = req.session.user.uid,
            trashPath = root + 'trash/' + userName,
            files = req.body.files,
            d = new Date(),
            time = (d.toDateString()).replace(/ /ig, '-'),
            previousFile = '',
            failedFile = [];

        if (!Array.isArray(files) || files.length === 0) {
            res.json({ret: -1,error: '文件字段错误。'});
            return false;
        }

        files.reduce(function (p, file) {
            if (file) {
                return p.then(function () {
                    var decodedPath = decodeURL(validator.trim(file)),
                        targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath);
                    previousFile = decodedPath.basePath;
                    return fs.moveAsync(
                        targetPath,
                        trashPath + '/' + decodedPath.middlePath + '/' + time + '-' + decodedPath.basePath
                    );
                }).catch(function (err) {
                    log.error(err.stack);
                    failedFile.push({name: previousFile, error: err.message});
                });
            }
        }, Promise.resolve()).then(function () {
            if (failedFile.length) {
                res.json({ret: 1, files: failedFile});
            } else {
                res.json({ret: 0});
            }
        });
    });

    router.post(URL.fileList, function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        if (!req.body.type) {
            res.json({ret: -1, error: '路径类型字段为空！'});
            return false;
        }
        if (!req.body.dir) {
            res.json({ret: -1,error: '路径字段为空。'});
            return false;
        }
        var type = validator.trim(req.body.type),
            dir = validator.trim(req.body.dir),
            userName = req.session.user.uid,
            dstDir = realDir(type, userName, dir);
        if (type !== 'public' && type !== 'private') {
            res.json({ret: -1, error: '路径字段类型错误！'});
            return false;
        }
        readDir(dstDir).then(function (obj) {
            res.json({ret: 0, files: obj.files, folders: obj.folders});
        }).catch(function (err) {
            log.error(err.stack);
            res.json({ret: -1,error: err.message});
        });
    });

    router.post(URL.fileMove, function (req, res) {
        var decodedPath = decodeURL(validator.trim(req.body.target)),
            userName = req.session.user.uid,
            targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath),
            previousFile = '',
            failedFile = [];
        checkRequestBody(req).then(function (files) {
            files.reduce(function (p, file) {
                return p.then(function () {
                    previousFile = file;
                    return fs.moveAsync(file, targetPath + '/' + path.basename(file));
                }).catch(function (err) {
                    log.error(err.stack);
                    failedFile.push({
                        name: path.basename(previousFile),
                        error: err.message
                    });
                });
            }, Promise.resolve()).then(function () {
                if (! failedFile.length) {
                    res.json({ret: 0});
                } else if (failedFile.length === files.length) {
                    res.json({ret: -1, files: failedFile});
                } else {
                    res.json({ret: 1, files: failedFile});
                }
            });
        });
    });

    router.post(URL.fileCopy, function (req, res) {
        var decodedPath = decodeURL(validator.trim(req.body.target)),
            userName = req.session.user.uid,
            targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath),
            previousFile = '',
            failedFile = [];

        checkRequestBody(req).then(function (files) {
            files.reduce(function (p, file) {
                return p.then(function () {
                    previousFile = file;
                    return fs.copyAsync(file, targetPath + '/' + path.basename(file));
                }).catch(function (err) {
                    log.error(err.stack);
                    failedFile.push({name: path.basename(previousFile), error: err.message});
                });
            }, Promise.resolve()).then(function () {
                if (! failedFile.length) {
                    res.json({ret: 0,});
                } else if (failedFile.length === files.length) {
                    res.json({ret: -1, files: failedFile});
                } else {
                    res.json({ret: 1, files: failedFile});
                }
            });
        });
    });
};
