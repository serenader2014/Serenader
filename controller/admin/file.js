var fs = require('fs');
var path = require('path');
var config = require('../../config').config;

var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;


module.exports = function (router) {
    router.get('/files', auth_user, function (req, res, next) {
        var pathname = config.root_dir + '/upload/',
            files = [], 
            folders = [];

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

            res.render('admin_file', {adminPath: adminPath, locals: res.locals, files: files, folders: folders});
        });
    });

    router.get('/files/:file', auth_user, function (req, res, next) {
        var pathname = config.root_dir + '/upload/' + req.params.file,
            files = [],
            folders = [];

        fs.stat(pathname, function (err, stats) {
            if (err) res.send(err);

            if (stats.isDirectory()) {
                fs.readdir(pathname, function (err, f) {
                    if (err) res.send(err);

                    f.forEach(function (item, index) {
                        var stat = fs.statSync(pathname+item);

                        if (stat.isDirectory()) {
                            folders.push({name:item,createTime:stat.ctime,lastModifiedTime:stat.mtime});
                        } else {
                            files.push({name:item,size:stat.size,createTime:stat.ctime,lastModifiedTime:stat.mtime});
                        }
                    });
                    res.render('admin_file', {adminPath: adminPath, locals: res.locals, files: files, folders: folders});
                });
            } else if (stats.isFile()) {
                res.sendfile(pathname);
            }
        });
    });
};