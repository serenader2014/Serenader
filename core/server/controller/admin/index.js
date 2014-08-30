var express = require('express'),
    app = require('../../index'),
    adminHomePage = express.Router(),
    url = require('../../../../config').config.url,
    adminPath = url.admin,
    auth_user = require('../../utils/auth_user');


adminHomePage.get('/', auth_user, function (req, res, next) {
    res.render('admin_index', {adminPath: adminPath, locals: res.locals});
});

// require('./file')(adminHomePage);
// require('./gallery')(adminHomePage);
// require('./post')(adminHomePage);
// require('./setting')(adminHomePage);
require('./sign')(adminHomePage);
// require('./upload')(adminHomePage);
// require('./user')(adminHomePage);


module.exports = adminHomePage;
