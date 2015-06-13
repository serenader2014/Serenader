var Promise = require('bluebird');
var fs      = Promise.promisifyAll(require('fs-extra'));
var path    = require('path');
var _       = require('lodash');
var log     = require('../../utils/log')();
var upload  = require('../../utils/upload');
var config  = global.config;
var root    = config.root_dir;
var url     = config.url;

function parseUrl (targetUrl, userName) {
    if (!targetUrl) {
        return false;
    }
    targetUrl = targetUrl.lastIndexOf('/') === targetUrl.length - 1 ? targetUrl : targetUrl + '/';
    var parsedArr, type, dir, dstDir, target;

    parsedArr = _.compact(_.compact(targetUrl.split(url.upload))[0].split('/'));
    type = _.first(parsedArr);
    dir = _.drop(parsedArr);
    dstDir = dir.join('/');
    target = path.resolve(root, 'content', 'data', type, userName, 'upload', dstDir);
    return {
        type: type,
        path: dstDir,
        target: target
    };
}

module.exports = function (router) {
    router.post(url.upload + '/*', function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        var userName = req.session.user.uid,
            parsed = parseUrl(req.url, userName);

        if (parsed.type !== 'public' && parsed.type !== 'private') {
            res.json({
                ret: -1,
                error: '类别错误。'
            });
            return false;
        }

        upload(req, res, {
            uploadDir: parsed.target,
            baseUrl: '/static/' + userName + (parsed.path ? '/upload/' + parsed.path : '/upload') ,
            deleteUrl: url.admin + url.upload + '/' + parsed.type + '/' + userName + (parsed.path ? '/upload/' + parsed.path : '/upload')
        }).then(function (files) {
            res.json({
                ret: 0,
                data: files
            });
        }).catch(function (err) {
            log.error(err);
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
        var userName = req.session.user.uid,
            parsed = parseUrl(req.url, userName);

        if (parsed.type !== 'public' && parsed.type !== 'private') {
            res.json({
                ret: -1,
                error: '类别错误。'
            });
            return false;
        }

        fs.removeAsync(decodeURIComponent(parsed.target)).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            log.error(err);
            res.json({ret: -1, error: err});
        });
    });
};