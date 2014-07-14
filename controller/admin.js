var express = require('express');

var User = require('../proxy').user;

var adminHomePage = express.Router();

adminHomePage.get('/',function (req, res, next) {
    req.session.cookie.maxAge = 1000*60*20;
    if (req.session.user) {
        res.locals.user = req.session.user;
        res.render('admin');
    } else {
        res.redirect(req.originalUrl+'/signin');
    }
});

adminHomePage.get('/signin', function (req, res, next) {
    if (req.session.user) {
        res.redirect(req.originalUrl.substring(0,req.originalUrl.lastIndexOf('/')));
    } else {
        res.render('signin');
    }
});


adminHomePage.post('/signin', function (req, res, next) {
    var email = req.body.email,
        password = req.body.password;

    User.getOneUserByEmail(email, function(err, u) {
        if (err) res.end(401);
        if (u) {
            if (u.pwd === password) {
                req.session.user = u.uid;
                res.redirect('/');
            } else {
                res.send('incorrect password');
            }
        } else {
            res.send('uesr does not exist');
        }
    });
});

adminHomePage.get('/signup', function (req, res, next) {
    if (req.session.user) {
        res.redirect(req.originalUrl.substring(0,req.originalUrl.lastIndexOf('/')));
    } else {
        res.render('signup');
    }
})

adminHomePage.post('/signup', function (req, res, next) {
    var uid = req.body.id,
        email = req.body.email,
        password = req.body.password;


    // TODO validate the req.body




    User.getOneUserById(uid, function (err, u) {
        if (err) res.end(401);
        if (!u) {
            User.getOneUserByEmail(email, function (err, u) {
                if (err) res.end(401);
                if (!u) {
                    User.getAllUser(function (err, users) {
                        if (users.length <= 0) {
                            User.createNewUser(uid, email, password, 'admin', function (err) {
                                if (err) res.end(401);
                            });
                        } else {
                            User.createNewUser(uid, email, password, 'user', function (err) {
                                if (err) res.end(401);
                            });
                        }
                        res.redirect(req.originalUrl.substring(0,req.originalUrl.lastIndexOf('/'))+'/signin');
                    });           
                } else {
                    res.send("User exist");
                }
            });
        } else {
            res.send("User exist");
        }
    });
});


module.exports = adminHomePage;