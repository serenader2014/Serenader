var fs = require('fs'),
    path = require('path'),
    parse = require('url').parse,
    config = require('../../../../config').config,
    URL = config.url,
    auth_user = require('../../utils/auth_user'),
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
        }

        fs.readdir(root + type + '/' + userName + '/upload', function (err, f) {
            if (err) {
                errorHandling(req, res, { error: err, type: 500});
                return false;
            }
            f.forEach(function (item, index) {
                try {
                    var stat = fs.statSync(root + type + '/' + userName + '/upload/' + item);
                    if (stat.isDirectory()) {
                        folders.push({name:item,createTime:stat.ctime,lastModifiedTime:stat.mtime});
                    } else {
                        files.push({name:item,size:stat.size,createTime:stat.ctime,lastModifiedTime:stat.mtime});
                    }
                }
                catch (err) {
                    errorHandling(req, res, { error: err, type: 500});
                    return false;
                }

            });

            res.render('admin_file', {
                files: files, 
                folders: folders, 
                baseLink: url.pathname
            });
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
        fs.stat(oldPath, function (err, stats) {
            if (err) {
                errorHandling(req, res, { error: err, type: 500});
                return false;
            } else {
                type = stats.isDirectory() ? 'directory' : 'file';
            }
            fs.stat(targetPath, function (err, stats) {
                if (err && err.code === 'ENOENT') {
                    fs.rename(oldPath, targetPath,function (err) {
                        if (err) {
                            errorHandling(req, res, { error: err, type: 500});
                            return false;
                        } else {
                            res.redirect(adminPath + URL.adminFile + '/' + t + '/' + filePath);
                        }
                    });
                } else {
                    if (stats.isDirectory() && type === 'directory') {
                        errorHandling(req, res, { error: 'Directory already exist.', type: 500});
                        return false;
                    } else if (stats.isFile() && type === 'file') {
                        errorHandling(req, res, { error: 'File already exist.', type: 500});
                        return false;
                    }
                }
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
        fs.writeFile(pathname, newContent, {encoding: 'utf8'}, function (err) {
            if (err) {
                res.status(501).send({
                    status: 0,
                    error: err
                });
                return false;
            } else {
                res.send({
                    status: 1,
                    error: ''
                });
            }
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
            trashPath = root + 'trash/' + userName;
        fs.stat(root+'trash/', function (err, stats) {
            if (err && err.code === 'ENOENT') {
                fs.mkdirSync(root+'trash');
            }
            fs.stat(trashPath, function (err, stats) {
                var d, time, arr, tmp, result;

                d = new Date();
                time = (d.toDateString()).replace(/ /ig, '-');
                if (err && err.code === 'ENOENT') {
                    fs.mkdirSync(trashPath);
                }
                arr = filePath.split('/');
                tmp = '';
                result = [];
                arr.forEach(function (item, index) {
                    if (item !== '') {
                        tmp = tmp + '/' + item;
                        result.push(tmp);
                    }
                });
                result.forEach(function (item, index) {
                    fs.stat(trashPath+item, function (err, stats) {
                        if (err && err.code === 'ENOENT') {
                            fs.mkdirSync(trashPath+item);
                        }
                    });
                });
                fs.rename(pathname, trashPath + '/' +filePath + time + '-' +fileName ,function (err) {
                    if (err && err.code === 'EPERM') {
                        res.json({
                            status: 0,
                            error: 'File/directory already exist'
                        });
                        return false;
                    }
                    res.json({
                        status: 1,
                        error: ''
                    });
                });
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
        }
        if (req.params.type !== 'public' && req.params.type !== 'private') {
            next();
        }
        fs.stat(pathname, function (err, stats) {
            if (err || ! stats) {
                errorHandling(req, res, { error: 'Read directory/file error.', type: 500});
                return false;
            }
            if (stats.isDirectory()) {
                fs.readdir(pathname, function (err, f) {
                    if (err) {
                        errorHandling(req, res, { error: 'Read directory error.', type: 500});
                        return false;
                    }
                    f.forEach(function (item, index) {
                        var stat = fs.statSync(pathname+'/'+item);

                        if (stat.isDirectory()) {
                            folders.push({name:item,createTime:stat.ctime,lastModifiedTime:stat.mtime});
                        } else {
                            files.push({name:item,size:stat.size,createTime:stat.ctime,lastModifiedTime:stat.mtime});
                        }
                    });
                    res.render('admin_file', {
                        files: files,
                        folders: folders,
                        baseLink: acturalPath
                    });
                });
            } else if (stats.isFile()) {
                if (req.query.download === 'direct') {
                    res.download(pathname.split('?download=direct')[0]);
                    return;
                }
                var fileName = acturalPath.substring(acturalPath.lastIndexOf('/')+1);
                if (/txt|html|css|scss|sass|htm|xml|js|py|json|md|markdown|jade|php|xml/gi
                    .test(fileName.substring(fileName.lastIndexOf('.')+1))) {
                    var mode = convertFileExtension(fileName.substring(fileName.lastIndexOf('.')+1));
                    fs.readFile(pathname, {encoding:'utf8'}, function (err, data) {
                        if (err) {
                            errorHandling(req, res, { error: 'Read file error.', type: 500});
                            return false;
                        }
                        res.render('admin_file_preview', {
                            file: data, 
                            link: acturalPath, 
                            mode: mode
                        });
                    });
                } else {
                    res.sendfile(pathname);
                }
            }
        });
    });
};




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