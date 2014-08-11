var adminPath = require('./index').adminPath;
var auth_user = require('./index').auth_user;
var root = require('../../config').config.root_dir;
var upload = require('blueimp-file-upload-expressjs');


module.exports = function (router) {

    router.get('/upload', auth_user, function (req, res, next) {
        res.render('admin_upload', {adminPath: adminPath, locals: res.locals});
    });

    router.post('/upload', auth_user, function (req, res, next) {

        var opt  ={
            tmpDir: root + '/data/tmp',
            uploadDir: root + '/data/public/' + req.session.user.uid + '/upload',
            uploadUrl: adminPath + '/upload',
            maxPostSize: 11000000000,
            minFileSize:  1,
            maxFileSize:  10000000000,
            acceptFileTypes:  /.+/i,
            inlineFileTypes:  /\.(gif|jpe?g|png)/i,
            imageTypes:  /\.(gif|jpe?g|png)/i,
            imageVersions: {
                width:  150,
                height: 150
            },
            accessControl: {
                allowOrigin: '*',
                allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
                allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
            },            
        };

        var uploader = upload(opt);

        uploader.post(req, res, function (fileInfo) {
            res.send(fileInfo);
            console.llg(fileInfo);
        });

    });

    router.post('/upload/content', auth_user, function (req, res, next) {
        var opt  ={
            tmpDir: root + '/data/tmp',
            uploadDir: root + '/data/public/' + req.session.user.uid + '/post',
            uploadUrl: adminPath + '/upload/content',
            maxPostSize: 11000000000,
            minFileSize:  1,
            maxFileSize:  10000000000,
            acceptFileTypes:  /.+/i,
            inlineFileTypes:  /\.(gif|jpe?g|png)/i,
            imageTypes:  /\.(gif|jpe?g|png)/i,
            imageVersions: {
                width:  150,
                height: 150
            },
            accessControl: {
                allowOrigin: '*',
                allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
                allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
            },            
        };

        var uploader = upload(opt);

        uploader.post(req, res, function (fileInfo) {
            res.send(fileInfo);
        });
    });


};