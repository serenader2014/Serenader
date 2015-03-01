var express = require('express'),
    adminHomePage = express.Router(),
    auth_user = require('../../utils/auth_user');


adminHomePage.get('/', auth_user, function (req, res) {
    res.render('dashboard');
});

require('./sign')(adminHomePage);

module.exports = adminHomePage;
