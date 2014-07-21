var fs = require('fs');
var path = require('path');
var parse = require('url').parse;
var AdmZip = require('adm-zip');
var config = require('../../config').config;

var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;

var root = config.root_dir + '/upload/';


module.exports = function (router) {
    router.get('/files', auth_user, function (req, res, next) {
        var url = parse(req.url);
        var files = [];
        var folders = [];
        if (url.pathname.substring(url.pathname.length-1) === '/') {
            res.redirect(adminPath+url.pathname.substring(0, url.pathname.length-1));
        }
        fs.stat(root, function (err, stats) {
            if (err && err.code === 'ENOENT') {
                fs.mkdirSync(root);
            }
            fs.readdir(root, function (err, f) {
                f.forEach(function (item, index) {
                    var stat = fs.statSync(root+item);

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

    router.get('/files/*', auth_user, function (req, res, next) {
        var url = parse(req.url);
        var acturalPath = decodeURIComponent(url.pathname);
        var pathname = root + decodeURL(acturalPath).filePath+decodeURL(acturalPath).fileName,
            files = [],
            folders = [];
        if (acturalPath.substring(acturalPath.length-1) === '/') {
            res.redirect(adminPath+acturalPath.substring(0, req.url.length-1));
        }
        if (req.query.download === 'direct') {
            res.download(pathname.split('?download=direct')[0]);
            return;
        }
        fs.stat(pathname, function (err, stats) {
            if (err || ! stats) {
                console.error(err);
                next();
                return false;
            }
            if (stats.isDirectory()) {
                fs.readdir(pathname, function (err, f) {
                    if (err) res.send(err);

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
                var fileName = acturalPath.substring(acturalPath.lastIndexOf('/')+1);
                if (/txt|html|css|scss|sass|htm|xml|js|json|md|markdown|jade|php|xml/gi
                    .test(fileName.substring(fileName.lastIndexOf('.')+1))) {    
                    var mode = convertFileExtension(fileName.substring(fileName.lastIndexOf('.')+1));
                    fs.readFile(pathname, {encoding:'utf8'}, function (err, data) {
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

    router.post('/files/rename/*', auth_user, function (req, res, next) {
        var url = parse(req.url);
        var acturalPath = decodeURIComponent(url.pathname);
        var fileName = decodeURL(acturalPath, 'rename').fileName;
        var filePath = decodeURL(acturalPath, 'rename').filePath;
        var newName = req.body.name;
        fs.rename(root + filePath+fileName,root + filePath+newName,function (err) {
            if (err) {
                res.send([err,root]);
            } else {
                res.redirect(adminPath+'/files/'+filePath);
            }
        });
    });

    router.post('/files/edit/*', auth_user, function (req, res, next) {
        var url = parse(req.url);
        var acturalPath = decodeURIComponent(url.pathname);
        var newContent = req.body.file;
        var pathname = root + decodeURL(acturalPath,'edit').filePath + decodeURL(acturalPath,'edit').fileName;
        fs.writeFile(pathname, newContent, {encoding: 'utf8'}, function (err) {
            if (err) {
                res.send(err);
                return false;
            } else {
                res.redirect(adminPath+'/files/'+acturalPath.split('/files/edit/')[1]);
            }
        });
    });

    router.post('/files/delete/*', auth_user, function (req, res, next) {
        var url = parse(req.url);
        var acturalPath = decodeURIComponent(url.pathname);
        var fileName = decodeURL(acturalPath,'delete').fileName;
        var filePath = decodeURL(acturalPath, 'delete').filePath;
        var pathname = root + filePath + fileName;

        fs.stat(config.root_dir + '/trash', function (err, stats) {
            if (err && err.code === 'ENOENT') {
                fs.mkdir(config.root_dir+'/trash', function (err) {
                    if (err) {
                        res.send(err);
                    }
                    fs.rename(pathname, config.root_dir + '/trash/' + filePath + fileName, function (err) {
                        if (err) {
                            res.send(err);
                        }
                        res.redirect(adminPath+'/files/'+filePath);
                    });
                });
            } else if (stats.isDirectory()) {
                fs.rename(pathname, config.root_dir + '/trash/' + filePath + fileName, function (err) {
                    if (err) {
                        res.send(err);
                    }
                    res.redirect(adminPath+'/files/'+filePath);
                });
            } else {
                res.send('not a folder');
            }
        });
    });


    router.get('/files/unzip/*', auth_user, function (req,res,next) {
        var url = parse(req.url);
        var acturalPath = decodeURIComponent(url.pathname);
        var fileName = decodeURL(acturalPath,'unzip').fileName;
        var filePath = decodeURL(acturalPath,'unzip').filePath;
        var pathname = root + filePath + fileName;
        var zip = new AdmZip(pathname);
        var zipEntries = zip.getEntries();
        // TODO handle zip file
        res.send(zipEntries);
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
    }
}

function decodeURL (url, mode) {
    var filePath = mode ? 
    (url.split('/files/'+mode+'/')[1]).substring(0,url.split('/files/'+mode+'/')[1].lastIndexOf('/')+1) :
    (url.split('/files/')[1]).substring(0,url.split('/files/')[1].lastIndexOf('/')+1);
    var fileName = url.substring(url.lastIndexOf('/')+1);

    return {
        filePath: filePath,
        fileName: fileName
    };
}