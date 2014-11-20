var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    path = require('path'),
    xss = require('xss'),
    validator = require('validator'),
    config = require('../../../../config').config,
    URL = config.url,
    auth_user = require('../../utils/auth_user'),
    log = require('../../utils/log')(),
    errorHandling = require('../../utils/error'),
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

function handleCodePreview (fileName, callback) {
    switch (path.extname(fileName).toLowerCase()) {
        case '.html':
        case '.xml' :
        case '.htm': 
            callback('html'); 
            break;
        case '.scss':
            callback('scss');
            break;
        case '.sass':
            callback('sass');
            break;
        case '.js':
        case '.json':
            callback('javascript');
            break;
        case '.jade':
            callback('jade');
            break;
        case '.php':
            callback('php');
            break;
        case '.md':
        case '.markdown':
        case '.txt':
            callback('markdown');
            break;
        case '.py':
            callback('python');
            break;
        default:
            callback(null);
            break;
    }
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


module.exports = function (router) {

    router.get(URL.adminFile, auth_user, function (req, res) {
        res.render('admin_file');
    });

    router.post(URL.adminNewFile, auth_user, function (req, res) {
        var fileName = validator.trim(xss(req.body.name)),
            type = validator.trim(xss(req.body.type)),
            dir = validator.trim(xss(req.body.dir)),
            decodedPath = decodeURL(dir),
            userName = req.session.user.uid,
            targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath);

        if (type === 'file') {
            fs.writeFileAsync(targetPath + '/' + fileName, '').then(function () {
                res.json({
                    status: 1,
                    error: ''
                });
            }).catch(function (err) {
                res.json({
                    status: 0,
                    error: err.message
                });
            });
        } else if (type === 'folder') {
            fs.mkdirsAsync(targetPath + '/' + fileName).then(function () {
                res.json({
                    status: 1,
                    error: ''
                });
            }).catch(function (err) {
                res.json({
                    status: 0,
                    error: err.message
                });
            });
        } else {
            res.json({
                status: 0,
                error: 'not a valid type'
            });
            return false;
        }
    });

    router.post(URL.adminFile, auth_user, function (req, res) {
        // req.body.files format:
        // [{
        //     path: '/public/some/path',
        //     oldName: 'name.name',
        //     newName: 'new.name'
        // },
        // {
        //    
        // }]
        var userName = req.session.user.uid,
            files = req.body.files,
            previousFile = '',
            failedFile = [];

        if (!Array.isArray(files) || files.length === 0) {
            res.json({
                status: 0,
                error: 'files not valid'
            });
            return false;
        }

        files.reduce(function (p, file) {
            return p.then(function () {
                if (file.path !== '' && file.oldName !== '' && file.newName !== '') {
                    var decodedPath = decodeURL(validator.trim(xss(file.path))),
                        targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath),
                        oldName = validator.trim(xss(file.oldName)),
                        newName = validator.trim(xss(file.newName));
                    if (decodedPath.type === 'public' || decodedPath.type === 'private') {
                        previousFile = oldName;
                        return fs.renameAsync(targetPath + '/' + oldName, targetPath + '/' + newName);
                    }
                }
            }).catch(function (err) {
                log.error(err.stack);
                failedFile.push({
                    name: previousFile,
                    error: err.message
                });
            });
        }, Promise.resolve()).then(function () {
            if (failedFile.length) {
                res.json({
                    status: -1,
                    files: failedFile
                });
            } else {
                res.json({
                    status: 1,
                });
            }
        });
    });

    router.put(URL.adminFileEdit, auth_user, function (req, res) {
        if (!req.body.dir) {
            res.json({
                status: 0,
                error: 'dir not valid'
            });
            return false;
        }
        var userName = req.session.user.uid,
            newContent = req.body.file,
            decodedPath = decodeURL(validator.trim(xss(req.body.dir))),
            targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath);
        fs.writeFileAsync(targetPath, newContent, { encoding: 'utf8'}).then(function () {
            res.json({
                status: 1,
                error: ''
            });
        }).catch(function (err) {
            res.json({
                status: 0,
                error: err.message
            });
        });
    });

    router.delete(URL.adminFile, auth_user, function (req, res) {
        var userName = req.session.user.uid,
            trashPath = root + 'trash/' + userName,
            files = req.body.files,
            d = new Date(),
            time = (d.toDateString()).replace(/ /ig, '-'),
            previousFile = '',
            failedFile = [];

        if (!Array.isArray(files) || files.length === 0) {
            res.json({
                status: 0,
                error: 'files not valid'
            });
            return false;
        }

        files.reduce(function (p, file) {
            if (file) {
                return p.then(function () {
                    var decodedPath = decodeURL(validator.trim(xss(file))),
                        targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath);
                    previousFile = decodedPath.basePath;
                    return fs.moveAsync(
                        targetPath, 
                        trashPath + '/' + decodedPath.middlePath + '/' + time + '-' + decodedPath.basePath
                    ); 
                }).catch(function (err) {
                    log.error(err.stack);
                    failedFile.push({
                        name: previousFile,
                        error: err.message
                    });
                });
            }
        }, Promise.resolve()).then(function () {
            if (failedFile.length) {
                res.json({
                    status: -1,
                    files: failedFile
                });
            } else {
                res.json({
                    status: 1
                });
            }
        });      
    });

    router.post(URL.adminFileList, auth_user, function (req, res) {
        if (!req.body.dir) {
            res.json({
                status: 0,
                error: 'dir not valid'
            });
            return false;
        }
        var decodedPath = decodeURL(validator.trim(xss(req.body.dir))),
            userName = req.session.user.uid,
            dstDir = realDir(decodedPath.type, userName, decodedPath.fullPath);
        readDir(dstDir).then(function (obj) {
            res.json({
                status: 1,
                files: obj.files,
                folders: obj.folders
            });
        }).catch(function (err) {
            log.error(err.stack);
            res.json({
                status: 0,
                error: err.message
            });
        });
    });

    router.post(URL.adminFileMove, auth_user, function (req, res) {
        if (!req.body.files) {
            res.json({
                status: 0,
                error: 'no files to move'
            });
            return false;
        }
        if (!req.body.target) {
            res.json({
                status: 0,
                error: 'target empty'
            });
            return false;
        }
        if (!Array.isArray(req.body.files) || typeof req.body.target !== 'string') {
            res.json({
                status: 0,
                error: 'type error'
            });
            return false;
        }
        var files = [],
            decodedPath = decodeURL(validator.trim(xss(req.body.target))),
            userName = req.session.user.uid,
            targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath),
            previousFile = '',
            failedFile = [];

        if (decodedPath.type !== 'public' && decodedPath.type !== 'private') {
            res.json({
                status: 0,
                error: 'type not valid'
            });
            return false;
        }

        req.body.files.forEach(function (file) {
            if (file !== '') {
                var decoded = decodeURL(validator.trim(xss(file))),
                    name = realDir(decoded.type, userName, decoded.fullPath);
                files.push(name);
            }
        });

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
                res.json({
                    status: 1,
                });
            } else {
                res.json({
                    status: -1,
                    files: failedFile
                });
            }
        });
    });

    router.post(URL.adminFileCopy, auth_user, function (req, res) {
        if (!req.body.files) {
            res.json({
                status: 0,
                error: 'no files to copy'
            });
            return false;
        }
        if (!req.body.target) {
            res.json({
                status: 0,
                error: 'target empty'
            });
            return false;
        }
        if (!Array.isArray(req.body.files) || typeof req.body.target !== 'string') {
            res.json({
                status: 0,
                error: 'type error'
            });
            return false;
        }
        var files = [],
            decodedPath = decodeURL(validator.trim(xss(req.body.target))),
            userName = req.session.user.uid,
            targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath),
            previousFile = '',
            failedFile = [];

        if (decodedPath.type !== 'public' && decodedPath.type !== 'private') {
            res.json({
                status: 0,
                error: 'type not valid'
            });
            return false;
        }

        req.body.files.forEach(function (file) {
            if (file !== '') {
                var decoded = decodeURL(validator.trim(xss(file))),
                    name = realDir(decoded.type, userName, decoded.fullPath);
                files.push(name);
            }
        });

        files.reduce(function (p, file) {
            return p.then(function () {
                previousFile = file;
                return fs.copyAsync(file, targetPath + '/' + path.basename(file));
            }).catch(function (err) {
                log.error(err.stack);
                failedFile.push({
                    name: path.basename(previousFile),
                    error: err.message
                });
            });
        }, Promise.resolve()).then(function () {
            if (! failedFile.length) {
                res.json({
                    status: 1,
                });
            } else {
                res.json({
                    status: -1,
                    files: failedFile
                });
            }
        });
    });

    router.get(URL.adminFilePreview, auth_user, function (req, res) {
        if (!req.query.path) {
            errorHandling(req, res, { error: 'path not valid', type: 404});
            return false;
        }
        var decodedPath = decodeURL(validator.trim(xss(req.query.path))),
            userName = req.session.user.uid,
            targetPath = realDir(decodedPath.type, userName, decodedPath.fullPath);

        fs.statAsync(targetPath).then(function (stat) {
            if (stat.isFile()) {
                handleCodePreview(decodedPath.basePath, function (type) {
                    if (type) {
                        fs.readFileAsync(targetPath, { encoding: 'utf8'}).then(function (data) {
                            res.render('admin_file_preview', {
                                file: data,
                                link: validator.trim(xss(req.query.path)),
                                mode: type
                            });
                        }).catch(function (err) {
                            errorHandling(req, res, { error: err.message, type: 500});
                        });
                    } else {
                        res.sendfile(targetPath);
                    }
                });
            } else {
                errorHandling(req, res, { error: 'not a valid file', type: 404});
            }
        }).catch(function (err) {
            errorHandling(req, res, { error: err.message, type: 500});
        });

    });
};
