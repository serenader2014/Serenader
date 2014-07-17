var express = require('express');
var upload = require('jquery-file-upload-middleware');

var User = require('../proxy').user;
var Post = require('../proxy').post;
var Category = require('../proxy').category;
var Setting = require('../proxy').setting;

var config = require('../config').config;
var app = require('../app');

var adminPath = app.locals.adminPath;

function auth_user (req, res, next) {
    if (req.session.user) {
        res.locals.current_user = req.session.user;
        next();
    } else {
        res.redirect(adminPath+'/signin');
    }
}

var adminHomePage = express.Router();

adminHomePage.get('/', auth_user, function (req, res, next) {
    res.locals.current_user = req.session.user;
    res.render('admin_index', {adminPath: adminPath, locals: res.locals});
});


adminHomePage.get('/settings', auth_user, function (req, res, next) {
    res.locals.current_user = req.session.user;
    Setting.getSetting(function (err, s) {
        if (err) console.error(err);
        if (s) {
            res.render('admin_setting', {adminPath: adminPath, locals: res.locals, setting: s});
        } else {
            var setting = {name:'',desc:'',logo:'',favicon:'',nav:'',admin_path:'/admin',allow_sign_up:false};
            res.render('admin_setting', {adminPath: adminPath, locals: res.locals, setting: setting});
        }
    });
});

adminHomePage.post('/settings', auth_user, function (req, res, next) {
    var name = req.body.blog_title,
        desc = req.body.blog_desc,
        logo = req.body.blog_logo,
        favicon = req.body.blog_favicon,
        nav = [req.body.blog_navs],
        admin_path = req.body.blog_admin_path.substring(0,1) === '/' ? req.body.blog_admin_path : '/'+req.body.blog_admin_path,
        signup = req.body.blog_signup;
    Setting.getSetting(function (err, s) {
        if (err) res.send(err);
        if (s) {
            Setting.updateSetting(name, desc, logo, favicon, nav, admin_path, signup,function (err) {
                if (err) res.send(err);
                adminPath = admin_path;
                res.redirect(admin_path);
                process.exit();
            }); 
        } else {
            Setting.createSetting(name, desc, logo, favicon, nav, admin_path, signup, function (err) {
                if (err) res.send(err);
                adminPath = admin_path;
                res.redirect(admin_path);
                process.exit();
            }); 
        }
    });
});

adminHomePage.get('/signin', function (req, res, next) { 
    if (req.session.user) {
        res.redirect(adminPath);
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
                req.session.cookie.maxAge = 1000*60*20;
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

adminHomePage.get('/signup', function (req, res, next) {
    if (req.session.user) {
        res.redirect(adminPath);
    } else {
        res.render('signup');
    }
});

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


adminHomePage.get('/signout', function (req, res, next) {
    req.session.destroy();
    res.redirect(adminPath);
});

adminHomePage.get('/post', auth_user, function (req, res, next) {
    Post.getAllPosts(function (err, posts) {
        if (err) res.send(err);
        if (posts) {

            Category.getAllCategories(function (err, c) {
                if (err) res.send(err);
                if (c) {
                    res.render('admin_post_content', {adminPath: adminPath, locals: res.locals, posts: posts, categories: c});
                }
            });

        }
    });
});

adminHomePage.get('/post/new', auth_user, function (req, res, next) {
    Category.getAllCategories(function (err, c) {
        if (err) res.send(err);
        if (c) {
            res.render('admin_new_post', {adminPath: adminPath, locals: res.locals, categories: c});
        }
    });
});

adminHomePage.post('/post/new', auth_user, function (req, res, next) {
    var now = new Date();
    var title = req.body.title;
    var author = req.session.user.uid;
    var date = [{year: now.getFullYear(), month: now.getMonth(), date: now.getDate()}, now];
    var post = req.body.post;
    var tags = req.body.tag;
    var category = req.body.categories;

    Post.createNewPost(title, author, date, tags, post, category, function (err) {
        if (err) res.send(err);
        res.redirect(adminPath+'/post');
    });
});

adminHomePage.post('/category/new', auth_user, function (req, res, next) {
    // TODO validate the req.body

    var name = req.body.name;

    // TODO 查重
    Category.createNewCategory(name, function (err) {
        if (err) res.send(err);
        res.redirect(adminPath+'/post');
    });
});

adminHomePage.get('/upload', auth_user, function (req, res, next) {
    res.render('admin_upload', {adminPath: adminPath, locals: res.locals});
});

adminHomePage.use('/upload', upload.fileHandler());

module.exports = adminHomePage;

