var fs = require('fs');
var path = require('path');
var parse = require('url').parse;
var AdmZip = require('adm-zip');
var config = require('../../config').config;

var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;

var root = config.root_dir + '/data/';


module.exports = function (router) {
    router.get('/files', auth_user, function (req, res, next) {
        res.redirect(adminPath + '/files/public');
    });
    router.get('/files/:type', auth_user, function (req, res, next) {
        var url = parse(req.url);
        var files = [];
        var folders = [];
        var userName = req.session.user.uid;
        var type = req.params.type;
        if (type !== 'public' && type !== 'private') {
            next();
            return false;
        }
        if (url.pathname.substring(url.pathname.length-1) === '/') {
            res.redirect(adminPath+url.pathname.substring(0, url.pathname.length-1));
        }
        fs.stat(root, function (err, stats) {
            if (err && err.code === 'ENOENT') {
                fs.mkdirSync(root);
            }
            fs.stat(root + type + '/', function (err, stats) {
                if (err && err.code === 'ENOENT') {
                    fs.mkdirSync(root + type);
                }
                fs.stat(root + type + '/' + userName , function (err, stats) {
                    if (err && err.code === 'ENOENT') {
                        fs.mkdirSync(root + type + '/' + userName);
                    }
                    fs.stat(root + type + '/' + userName + '/upload', function (err, stats) {
                        if (err && err.code === 'ENOENT') {
                            fs.mkdirSync(root + type + '/' + userName + '/upload');
                        }
                        fs.readdir(root + type + '/' + userName + '/upload', function (err, f) {
                            f.forEach(function (item, index) {
                                var stat = fs.statSync(root + type + '/' + userName + '/upload/' + item);

                                if (stat.isDirectory()) {
                                    folders.push({name:item,createTime:stat.ctime,lastModifiedTime:stat.mtime});
                                } else {
                                    files.push({name:item,size:stat.size,createTime:stat.ctime,lastModifiedTime:stat.mtime});
                                }
                            });

                            res.render('admin_file', {
                                adminPath: adminPath, 
                                locals: res.locals, 
                                files: files, folders: folders, 
                                baseLink: url.pathname
                            });
                        });
                    });
                });
            });
        });
    });


    router.post('/files/rename/*', auth_user, function (req, res, next) {
        var url = parse(req.url);
        var userName = req.session.user.uid;
        var acturalPath = decodeURIComponent(url.pathname);
        var fileName = decodeURL(acturalPath, 'rename').fileName;
        var filePath = decodeURL(acturalPath, 'rename').filePath;
        var t = decodeURL(acturalPath, 'rename').type;
        var newName = req.body.name;
        var oldPath = root + t + '/' + userName + '/upload/' + filePath + fileName;
        var targetPath = root + t + '/' +userName + '/upload/' + filePath + newName;
        var type;
        fs.stat(oldPath, function (err, stats) {
            if (err) {
                res.send(err);
                return false;
            } else {
                type = stats.isDirectory() ? 'directory' : 'file';
            }
            fs.stat(targetPath, function (err, stats) {
                if (err && err.code === 'ENOENT') {
                    fs.rename(oldPath, targetPath,function (err) {
                        if (err) {
                            res.send([err,root]);
                        } else {
                            res.redirect(adminPath+'/files/'+t+'/'+filePath);
                        }
                    });
                } else {
                    if (stats.isDirectory() && type === 'directory') {
                        res.send('directory already exist');
                        return false;
                    } else if (stats.isFile() && type === 'file') {
                        res.send('file already exist');
                        return false;
                    }
                }
            });
        });
    });

    router.post('/files/edit/*', auth_user, function (req, res, next) {
        var url = parse(req.url);
        var userName = req.session.user.uid;
        var acturalPath = decodeURIComponent(url.pathname);
        var newContent = req.body.file;
        var filePath = decodeURL(acturalPath, 'edit').filePath;
        var fileName = decodeURL(acturalPath, 'edit').fileName;
        var t = decodeURL(acturalPath, 'edit').type;
        var pathname = root + t + '/' + userName + '/upload/' + filePath + fileName;
        fs.writeFile(pathname, newContent, {encoding: 'utf8'}, function (err) {
            if (err) {
                res.send(err);
                return false;
            } else {
                res.redirect(adminPath+'/files/'+t+'/'+filePath+fileName);
            }
        });
    });

    router.post('/files/delete/*', auth_user, function (req, res, next) {
        var url = parse(req.url);
        var userName = req.session.user.uid;
        var acturalPath = decodeURIComponent(url.pathname);
        var fileName = decodeURL(acturalPath,'delete').fileName;
        var filePath = decodeURL(acturalPath, 'delete').filePath;
        var t = decodeURL(acturalPath, 'delete').type;
        var pathname = root + t + '/' + userName + '/upload/' + filePath + fileName;
        var trashPath = root + 'trash/' + userName;
        fs.stat(root+'trash/', function (err, stats) {
            if (err && err.code === 'ENOENT') {
                fs.mkdirSync(root+'trash');
            }
            fs.stat(trashPath, function (err, stats) {
                var d = new Date();
                var time = (d.toDateString()).replace(/ /ig, '-');
                if (err && err.code === 'ENOENT') {
                    fs.mkdirSync(trashPath);
                }
                var arr = filePath.split('/');
                var tmp = '';
                var result = [];
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
                        res.send(['file/directory exist', err]);
                        return false;
                    }
                    res.redirect(adminPath + '/files/' + t + '/' + filePath);
                });
            });
        });                
    });


    router.get('/files/zip/unzip/*', auth_user, function (req,res,next) {
        var url = parse(req.url);
        var userName = req.session.user.uid;
        var acturalPath = decodeURIComponent(url.pathname);
        var fileName = decodeURL(acturalPath,'zip/unzip').fileName;
        var filePath = decodeURL(acturalPath,'zip/unzip').filePath;
        var t = decodeURL(acturalPath, 'zip/unzip').type;
        var pathname = root + t + '/' + userName + '/upload/' + filePath + fileName;
        var zip = new AdmZip(pathname);
        var zipEntries = zip.getEntries();
        // TODO handle zip file
        fs. mkdir(pathname.split('.zip')[0], function (err) {
            if (err) {
                res.send(err);
                return false;
            }
            // TODO fix the chinese charator problem
            zip.extractAllTo(pathname.split('.zip')[0],true);
            res.redirect(adminPath+'/files/'+t+'/'+filePath+fileName.split('.zip')[0]);
        });
        // res.send(zipEntries);
    });


    // router.get('/files/zip/preview/*', auth_user, function (req, res, next) {
    //     var url = parse(req.url);
    //     var userName = req.session.user.uid;
    //     var acturalPath = decodeURIComponent(url.pathname);
    //     var fileName = decodeURL(acturalPath,'zip/preview').fileName;
    //     var filePath = decodeURL(acturalPath,'zip/preview').filePath;
    //     var pathname = root + userName + '/upload/' + filePath + fileName;
    //     var zip = new AdmZip(pathname);
    //     var zipEntries = zip.getEntries();
    //     var files = [];
    //     var folders = [];

    //     TODO zip file preview

    //     zipEntries.forEach(function (item, index) {
    //         if (! item.entryName.split('/')[1]) {
    //             if (! item.isDirectory) {
    //                 files.push({name:item.entryName.split('/')[item.entryName.split('/').length], time: item.header.time, size: item.header.compressedSize});
    //             } else {
    //                 folders.push({name:item.entryName.split('/')[item.entryName.split('/').length], time: item.header.time, size: item.header.compressedSize});
    //             }
    //         }
    //     });
    //     res.render('admin_zip_preview', {
    //         adminPath: adminPath, 
    //         locals: res.locals,
    //         files: files, 
    //         folders: folders,
    //         link: acturalPath
    //     });
        
    //     res.send(zipEntries);
    // });
    router.get('/files/:type/*', auth_user, function (req, res, next) {
        var url = parse(req.url);
        var userName  =req.session.user.uid;
        var acturalPath = decodeURIComponent(url.pathname);
        var file_path = decodeURL(acturalPath).filePath;
        var file_name = decodeURL(acturalPath).fileName;
        var t = decodeURL(acturalPath).type;
        var pathname = root + t + '/' + userName + '/upload/' + file_path + file_name;
        var files = [];
        var folders = [];
        if (acturalPath.substring(acturalPath.length-1) === '/') {
            res.redirect(adminPath+acturalPath.substring(0, req.url.length-1));
        }
        if (req.params.type !== 'public' && req.params.type !== 'private') {
            next();
        }
        fs.stat(pathname, function (err, stats) {
            if (err || ! stats) {
                console.log(['read directory/file error',err]);
                return false;
            }
            if (stats.isDirectory()) {
                fs.readdir(pathname, function (err, f) {
                    if (err) {
                        res.send(['read directory error',err]);
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
                        adminPath: adminPath, 
                        locals: res.locals, 
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
                            res.send(['read file error',err]);
                            return false;
                        }
                        res.render('admin_file_preview', {
                            adminPath: adminPath, 
                            locals: res.locals, 
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
        return {dependency: ['xml','htmlmixed'], mode: 'htmlmixed'};
    } else if (/css/i.test(fileName)) {
        return {dependency: ['css'], mode: 'css'};
    } else if (/scss|sass/i.test(fileName)) {
        return {dependency: ['sass'], mode: 'sass'};
    } else if (/js|json/i.test(fileName)) {
        return {dependency: ['javascript'], mode: 'javascript'};
    } else if (/jade/i.test(fileName)) {
        return {dependency: ['javascript','css','xml','htmlmixed','jade'], mode: 'jade'};
    } else if (/php/i.test(fileName)) {
        return {dependency: ['htmlmixed','xml','javascript','css','clike','php'], mode: 'php'};
    } else if (/txt|md|markdown/i.test(fileName)) {
        return {dependency:[], mode: 'null'};
    } else if (/py/i.test(fileName)) {
        return {dependency:['python'], mode: 'python'};
    }
}

function decodeURL (url, mode) {
    var filePath = mode ? 
    (url.split('/files/'+mode+'/')[1]).substring(url.split('/files/'+mode+'/')[1].indexOf('/')+1 ,url.split('/files/'+mode+'/')[1].lastIndexOf('/')+1) :
    (url.split('/files/')[1]).substring(url.split('/files/')[1].indexOf('/')+1 ,url.split('/files/')[1].lastIndexOf('/')+1);
    var fileName = url.substring(url.lastIndexOf('/')+1);
    var type = mode ?
    (url.split('/files/'+mode+'/')[1]).substring(0,url.split('/files/'+mode+'/')[1].indexOf('/')) :
    (url.split('/files/')[1]).substring(0, url.split('/files/')[1].indexOf('/'));

    return {
        filePath: filePath,
        fileName: fileName,
        type: type
    };
}