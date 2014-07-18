var adminPath = require('./index').adminPath;
var User = require('../../proxy').user;


module.exports = function (router) {
    router.get('/signin', function (req, res, next) { 
        if (req.session.user) {
            res.redirect(adminPath);
        } else {
            res.render('signin');
        }
    });


    router.post('/signin', function (req, res, next) {
        var email = req.body.email,
            password = req.body.password;

        User.getOneUserByEmail(email, function(err, u) {
            if (err) res.end(401);
            if (u) {
                if (u.pwd === password) {
                    req.session.user = u;
                    res.redirect(adminPath);
                } else {
                    res.send('incorrect password');
                }
            } else {
                res.send('uesr does not exist');
            }
        });
    });

    router.get('/signup', function (req, res, next) {
        if (req.session.user) {
            res.redirect(adminPath);
        } else {
            res.render('signup');
        }
    });

    router.post('/signup', function (req, res, next) {
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


    router.get('/signout', function (req, res, next) {
        req.session.destroy();
        res.redirect(adminPath);
    });
};