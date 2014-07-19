var fs = require('fs');
var path = require('path');
var config = require('../../config').config;

var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;


module.exports = function (router) {
    router.get('/files', auth_user, function (req, res, next) {
        var pathname = config.root_dir + '/upload/',
            url = req.url,
            files = [], 
            folders = [];
        if (req.url.substring(req.url.length-1) === '/') {
            res.redirect(adminPath+req.url.substring(0, req.url.length-1));
        }
        fs.readdir(pathname, function (err, f) {
            if (err) res.send(err);
            if (err && err.code === 'ENOENT') {
                fs.mkdirSync(pathname);
            }
            f.forEach(function (item, index) {
                var stat = fs.statSync(pathname+item);

                if (stat.isDirectory()) {
                    folders.push({name:item,createTime:stat.ctime,lastModifiedTime:stat.mtime});
                } else {
                    files.push({name:item,size:stat.size,createTime:stat.ctime,lastModifiedTime:stat.mtime});
                }
            });

            res.render('admin_file', {adminPath: adminPath, locals: res.locals, files: files, folders: folders, baseLink: url});
        });
    });

    router.get('/files/*', auth_user, function (req, res, next) {
        var url = req.url;
        var pathname = config.root_dir + '/upload/' + url.split('/files/')[1],
            files = [],
            folders = [];
        if (req.url.substring(req.url.length-1) === '/') {
            res.redirect(adminPath+req.url.substring(0, req.url.length-1));
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
                    res.render('admin_file', {adminPath: adminPath, locals: res.locals, files: files, folders: folders, baseLink: url});
                });
            } else if (stats.isFile()) {
                var fileName = url.substring(url.lastIndexOf('/')+1);
                if (/txt|html|css|scss|htm|xml|js|json|md|py|c|class|cpp|jade|php|xml/gi.test(fileName.substring(fileName.lastIndexOf('.')+1))) {    
                    fs.readFile(pathname, {encoding:'utf8'}, function (err, data) {
                        res.render('admin_file_preview', {adminPath: adminPath, locals: res.locals, file: data, link: url});
                    });
                } else {
                    res.sendfile(pathname);
                }
            }
        });
    });
};