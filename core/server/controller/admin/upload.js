var path = require('path'),
    Promise = require('bluebird'),
    validator = require('validator'),
    xss = require('xss'),
    auth_user = require('../../utils/auth_user'),
    log = require('../../utils/log')(),
    upload = require('../../utils/upload'),
    config = require('../../../../config').config,
    root = config.root_dir,
    url = config.url;


module.exports = function (router) {
    var uploadDir = function (req) {
        return root + '/content/data/public/' + req.session.user.uid + '/upload';
    };

    router.post(url.adminUpload + '/*', auth_user, function (req, res, next) {
        var userName = req.session.user.uid,
            dir = validator.trim(xss(req.url)).split(url.adminUpload + '/')[1],
            tmpArr = dir.split('/'),
            type = tmpArr.shift(),
            dstDir = tmpArr.join('/'),
            targetDir = root + '/content/data/' + type + '/' + userName + '/upload/' + dstDir;

        if (type !== 'public' && type !== 'private') {
            res.json({
                status: 0,
                error: 'type error'
            });
            return false;
        }

        upload(req, res, {
            uploadDir: targetDir,
            baseUrl: '/static/' + userName + '/upload/' + dstDir,
            deleteUrl: url.admin + '/' + url.adminUpload + '/' + type + '/' + userName + '/upload/' + dstDir
        }).then(function (files, field) {
            res.json(files);
        }).catch(function (err) {
            res.json({
                status: 0,
                error: err.message
            });
        });
    });

    router.delete(url.adminUpload + '/*', auth_user, function (req, res, next) {
        var dir = root + '/content/data/' + validator.trim(xss(req.ur)).split(url.adminUpload)[1],
            fileName = path.basename(dir);

        if (file) {
            fs.unlinkAsync(dir + '/' + file).then(function () {
                return Object.keys(options.imageVersions).reduce(function (p, version) {
                    return p.then(function () {
                        return fs.unlinkAsync(dir + '/' + version + '/' + file);
                    });
                }, Promise.resolve());
            }).then(function () {
                res.json({
                    status: 1
                });
            }).catch(function (err) {
                log.error(err.stack);
                res.json({
                    status: 0,
                    error: err.message
                });
            });
        }
    });
};