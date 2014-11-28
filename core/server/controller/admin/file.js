var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    path = require('path'),
    xss = require('xss'),
    validator = require('validator'),
    config = require('../../../../config').config,
    URL = config.url,
    auth_user = require('../../utils/auth_user'),
    errorHandling = require('../../utils/error'),
    root = config.root_dir + '/content/data/';



function realDir (type, username, lastPath) {
    return root + type + '/' + username + '/upload/' + lastPath;
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

    router.get(URL.file, auth_user, function (req, res) {
        res.render('admin_file');
    });

    router.get(URL.filePreview, auth_user, function (req, res) {
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
