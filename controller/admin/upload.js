var adminPath = require('./index').adminPath;
var auth_user = require('./index').auth_user;
var root = require('../../config').config.root_dir;
var upload = require('jquery-file-upload-middleware');


module.exports = function (router) {

    router.get('/upload', auth_user, function (req, res, next) {
        res.render('admin_upload', {adminPath: adminPath, locals: res.locals});
    });

    router.post('/upload', auth_user, function (req, res, next) {
        upload.fileHandler({
            uploadDir: function () {
                return root + '/data/public/' + req.session.user.uid + '/upload';
            },
            uploadUrl: function () {
                return adminPath + '/upload';
            }
        })(req, res, next);

        upload.on('end', function (fileInfo) {
            console.log(fileInfo);
        });
    });

    router.post('/upload/content', auth_user, function (req, res, next) {
        upload.fileHandler({
            uploadDir: function () {
                return root + '/data/public/' + req.session.user.uid + '/content';
            },
            uploadUrl: function () {
                return adminPath + '/upload/content';
            }
        })(req, res, next);

        upload.on('end', function (fileInfo) {
            // res.send(fileInfo);
        });
    });


};