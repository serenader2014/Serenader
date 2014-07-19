
var express = require('express');

var app = require('../../app');
var adminHomePage = express.Router();
var adminPath = app.locals.adminPath;

var auth_user = module.exports.auth_user = function (req, res, next) {
    if (req.session.user) {
        res.locals.current_user = req.session.user;
        next();
    } else {
        res.redirect(adminPath+'/signin');
    }
};

module.exports.adminPath = adminPath;

adminHomePage.get('/', auth_user, function (req, res, next) {
    res.render('admin_index', {adminPath: adminPath, locals: res.locals});
});

require('./file')(adminHomePage);
require('./gallery')(adminHomePage);
require('./post')(adminHomePage);
require('./setting')(adminHomePage);
require('./sign')(adminHomePage);
require('./upload')(adminHomePage);
require('./user')(adminHomePage);


module.exports = adminHomePage;
