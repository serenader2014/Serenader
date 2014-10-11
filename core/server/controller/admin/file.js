var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    mkdir = Promise.promisifyAll(require('mkdirp')),
    path = require('path'),
    parse = require('url').parse,
    config = require('../../../../config').config,
    URL = config.url,
    auth_user = require('../../utils/auth_user'),
    log = require('../../utils/log')(),
    errorHandling = require('../../utils/error'),
    root = config.root_dir + '/content/data/';


module.exports = function (router) {

    router.get(URL.adminFile, auth_user, function (req, res, next) {
        res.render('admin_file_root');
    });

    router.get(URL.adminFile + '/:type', auth_user, function (req, res, next) {
        var url = parse(req.url),
            files = [],
            folders = [],
            userName = req.session.user.uid,
            type = req.params.type;

        if (type !== 'public' && type !== 'private') {
            next();
            return false;
        }
        if (url.pathname.substring(url.pathname.length-1) === '/') {
            res.redirect(URL.admin+url.pathname.substring(0, url.pathname.length-1));
            return false;
        }

        readDir(root + type + '/' + userName + '/upload').then(function (obj) {
            res.render('admin_file', {
                files: obj.files,
                folders: obj.folders,
                baseLink: url.pathname
            });          
        }).catch(function (err) {
            errorHandling(req, res, { error: err.message, type: 500});
        });
    });

    router.post(URL.adminFileRename + '/*', auth_user, function (req, res, next) {
        var url = parse(req.url),
            userName = req.session.user.uid,
            acturalPath = decodeURIComponent(url.pathname),
            fileName = decodeURL(acturalPath, 'rename').fileName,
            filePath = decodeURL(acturalPath, 'rename').filePath,
            t = decodeURL(acturalPath, 'rename').type,
            newName = req.body.name,
            oldPath = root + t + '/' + userName + '/upload/' + filePath + fileName,
            targetPath = root + t + '/' +userName + '/upload/' + filePath + newName,
            type;

        fs.renameAsync(oldPath, targetPath).then(function () {
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

    router.post(URL.adminFileEdit + '/*', auth_user, function (req, res, next) {
        var url = parse(req.url),
            userName = req.session.user.uid,
            acturalPath = decodeURIComponent(url.pathname),
            newContent = req.body.file,
            filePath = decodeURL(acturalPath, 'edit').filePath,
            fileName = decodeURL(acturalPath, 'edit').fileName,
            t = decodeURL(acturalPath, 'edit').type,
            pathname = root + t + '/' + userName + '/upload/' + filePath + fileName;
        fs.writeFileAsync(pathname, newContent, { encoding: 'utf8'}).then(function () {
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

    router.post(URL.adminFileDelete + '/*', auth_user, function (req, res, next) {
        var url = parse(req.url),
            userName = req.session.user.uid,
            acturalPath = decodeURIComponent(url.pathname),
            fileName = decodeURL(acturalPath,'delete').fileName,
            filePath = decodeURL(acturalPath, 'delete').filePath,
            t = decodeURL(acturalPath, 'delete').type,
            pathname = root + t + '/' + userName + '/upload/' + filePath + fileName,
            trashPath = root + 'trash/' + userName,
            d = new Date(),
            time = (d.toDateString()).replace(/ /ig, '-');
        
        mkdir.mkdirpAsync(trashPath).then(function () {
            return fs.renameAsync(pathname, trashPath + '/' +filePath + time + '-' +fileName);
        }).then(function () {
            res.json({
                status: 1,
                error: ''
            });
        }).catch(function (err) {
            log.error(err.message);
            res.json({
                status: 0,
                error: err.message
            });
        });          
    });

    router.get(URL.adminFile + '/:type/*', auth_user, function (req, res, next) {
        var url = parse(req.url),
            userName  =req.session.user.uid,
            acturalPath = decodeURIComponent(url.pathname),
            file_path = decodeURL(acturalPath).filePath,
            file_name = decodeURL(acturalPath).fileName,
            t = decodeURL(acturalPath).type,
            pathname = root + t + '/' + userName + '/upload/' + file_path + file_name,
            files = [],
            folders = [];

        if (acturalPath.substring(acturalPath.length-1) === '/') {
            res.redirect(adminPath+acturalPath.substring(0, req.url.length-1));
            return false;
        }
        if (req.params.type !== 'public' && req.params.type !== 'private') {
            next();
            return false;
        }
        fs.statAsync(pathname).then(function (stat) {
            if (stat.isDirectory()) {
                readDir(pathname).then(function (obj) {
                    res.render('admin_file', {
                        files: obj.files,
                        folders: obj.folders,
                        baseLink: acturalPath
                    });
                });
            } else if (stat.isFile()) {
                if (req.query.download === 'direct') {
                    res.download(pathname.split('?download=direct')[0]);
                    return;
                }                
                if (/txt|html|css|scss|sass|htm|xml|js|py|json|md|markdown|jade|php|xml/gi
                    .test(file_name.substring(file_name.lastIndexOf('.')+1))) {
                    var mode = convertFileExtension(file_name.substring(file_name.lastIndexOf('.')+1));
                    fs.readFileAsync(pathname, { encoding: 'utf8'}).then(function (data) {
                        res.render('admin_file_preview', {
                            file: data,
                            link: acturalPath,
                            mode: mode
                        });
                    });
                } else {
                    res.sendfile(pathname);
                }
            } else {
                res.sendfile(pathname);
            }
        }).catch(function (err) {
            errorHandling(req, res, { error: err.message, type: 500});
        });
    });
};


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

function convertFileExtension (fileName) {
    if (/html|xml|htm/i.test(fileName)) {
        return 'html';
    } else if (fileName.toLowerCase() === 'css') {
        return 'css';
    } else if (/scss/i.test(fileName)) {
        return 'scss';
    } else if (/sass/i.test(fileName)) {
        return 'sass';
    } else if (/js|json/i.test(fileName)) {
        return 'javascript';
    } else if (/jade/i.test(fileName)) {
        return 'jade';
    } else if (/php/i.test(fileName)) {
        return 'php';
    } else if (/md|markdown|txt/i.test(fileName)) {
        return 'markdown';
    } else if (/py/i.test(fileName)) {
        return 'python';
    }
}

function decodeURL (url, mode) {
    var filePath = mode ? 
            (url.split('/files/'+mode+'/')[1]).substring(url.split('/files/'+mode+'/')[1].indexOf('/')+1 ,url.split('/files/'+mode+'/')[1].lastIndexOf('/')+1) :
            (url.split('/files/')[1]).substring(url.split('/files/')[1].indexOf('/')+1 ,url.split('/files/')[1].lastIndexOf('/')+1),

        fileName = url.substring(url.lastIndexOf('/')+1),

        type = mode ?
            (url.split('/files/'+mode+'/')[1]).substring(0,url.split('/files/'+mode+'/')[1].indexOf('/')) :
            (url.split('/files/')[1]).substring(0, url.split('/files/')[1].indexOf('/'));

    return {
        filePath: filePath,
        fileName: fileName,
        type: type
    };
}