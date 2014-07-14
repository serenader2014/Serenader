var express = require('express');
var adminHomePage = express.Router();

adminHomePage.get('/',function (req, res, next) {
    req.session.cookie.maxAge = 1000*60*20;
    if (req.session.user) {
        req.locals.user = req.session.user;
        res.render('admin');
    } else {
        res.redirect('/signin');
    }
});