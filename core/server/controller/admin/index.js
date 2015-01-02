var express = require('express'),
    adminHomePage = express.Router(),
    auth_user = require('../../utils/auth_user');


adminHomePage.get('/', auth_user, function (req, res) {
    res.render('dashboard');
});

require('./file')(adminHomePage);
require('./gallery')(adminHomePage);
require('./post')(adminHomePage);
require('./setting')(adminHomePage);
require('./sign')(adminHomePage);
require('./user')(adminHomePage);


module.exports = adminHomePage;
