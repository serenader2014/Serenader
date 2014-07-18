var adminPath = require('./index').adminPath;
var auth_user = require('./index').auth_user;
var upload = require('jquery-file-upload-middleware');


module.exports = function (router) {

    router.get('/upload', auth_user, function (req, res, next) {
        res.render('admin_upload', {adminPath: adminPath, locals: res.locals});
    });

    router.use('/upload', upload.fileHandler());


};