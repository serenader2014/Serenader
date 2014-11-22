var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    validator = require('validator'),
    xss = require('xss'),
    log = require('../../utils/log')(),
    upload = require('../../utils/upload'),
    config = require('../../../../config').config,
    root = config.root_dir,
    url = config.url;


module.exports = function (router) {
    router.post(url.upload + '/*', function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        var userName = req.session.user.uid,
            dir = validator.trim(xss(req.url)).split(url.upload + '/')[1],
            tmpArr = dir.split('/'),
            type = tmpArr.shift(),
            dstDir = tmpArr.join('/'),
            targetDir = root + '/content/data/' + type + '/' + userName + '/upload/' + dstDir;


        if (type !== 'public' && type !== 'private') {
            res.json({
                ret: -1,
                error: '类别错误。'
            });
            return false;
        }

        upload(req, res, {
            uploadDir: targetDir,
            baseUrl: '/static/' + userName + '/upload/' + dstDir,
            deleteUrl: url.admin + url.upload + '/' + type + '/' + userName + '/upload/' + dstDir
        }).then(function (files) {
            res.json(files);
        }).catch(function (err) {
            res.json({
                ret: -1,
                error: err.message
            });
        });
    });

    router.delete(url.upload + '/*', function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }        
        var tmpArr = validator.trim(xss(req.url)).split('/').slice(2),
            fileName = tmpArr.pop(),
            baseDir = root + '/content/data/' + tmpArr.join('/'),
            imageVersions = req.body.imageVersions;
                
        if (imageVersions && !Array.isArray(imageVersions)) {
            res.json({
                ret: -1,
                error: 'imageVersions must be an array'
            });
            return false;
        }

        fs.unlinkAsync(baseDir + '/' + fileName).then(function () {
            if (/\.(gif|jpe?g|png)$/i.test(fileName) && imageVersions.length > 0) {
                return imageVersions.reduce(function (p, version) {
                    if (version) {
                        version = validator.trim(xss(version));
                        return p.then(function () {
                            return fs.unlinkAsync(baseDir + '/' + version + '/' + fileName);
                        });
                    }
                }, Promise.resolve());
            }
        }).then(function () {
            res.json({
                ret: 1
            });
        }).catch(function (err) {
            log.error(err.stack);
            res.json({
                ret: -1,
                error: err.message
            });
        });
    });
};