var express = require('express'),
    adminHomePage = express.Router(),
    auth_user = require('../../utils/auth_user');


adminHomePage.get('/', auth_user, function (req, res, next) {
    res.render('admin_index');
});

// require('./file')(adminHomePage);
// require('./gallery')(adminHomePage);
require('./post')(adminHomePage);
require('./setting')(adminHomePage);
require('./sign')(adminHomePage);
// require('./upload')(adminHomePage);
// require('./user')(adminHomePage);


module.exports = adminHomePage;