var Promise = require('bluebird'),
    crypto = require('crypto'),
    fs = Promise.promisifyAll(require('fs')),
    fsx = Promise.promisifyAll(require('fs-extra')),
    xss = require('xss'),
    validator = require('validator'),
    User = require('../../models').User,
    log = require('../../utils/log')(),
    config = require('../../../../config').config,
    root = config.root_dir,
    url = config.url,
    assets = config.assetsUrl,
    locals = require('../../index').locals;

module.exports = function (router) {

    // read the background folder first, in order to render the sign in/up page's
    // background
    readBgFolder().then(function (list) {
        var bg;
        if (list.length === 0) {
            bg = assets.serverSideAssets + '/img/default_background.jpg';
        } else {
            bg = list[Math.floor(Math.random()*list.length)];
        }
        return bg;
    }).then(function (bg) {

        // router handler

        router.get(url.adminSignIn, function (req, res) { 
            if (req.session.user) {
                res.redirect(url.admin);
            } else {
                res.render('signin', {
                    background: bg, 
                    referer: req.headers.referer || url.admin + '/' + url.adminSignIn
                });
            }
        });

        router.post(url.adminSignIn, function (req, res) {
            var username = xss(validator.trim(req.body.username)),
                password = xss(validator.trim(req.body.password));

            User.getOneUserById(username).then(function (user) {
                if (user) {
                    if (user.pwd === md5(password)) {
                        req.session.user = user;
                        res.json({
                            status: 1, error: '', user: user.uid
                        });
                    } else {
                        res.json({
                            status: 0, error: '密码或用户名不正确！'
                        });
                    }
                } else {
                    res.json({
                        status: 0, error: '该用户尚未注册！'
                    });
                }
            });
        });
        
        router.get(url.adminSignUp, function (req, res, next) {
            if (req.session.user) {
                res.redirect(url.admin);
            } else {
                res.render('signup', {background: bg});
            }
        });

        router.post(url.adminSignUp, function (req, res, next) {
            var uid, email, password, hashedPwd, hashedEmail;
            
            if (! locals.setting.allow_sign_up) {
                res.json({
                    status: 0,
                    error: '帐号注册功能已经被系统管理员禁用！'
                });
                return false;
            }
            uid = xss(validator.trim(req.body.id));
            email = xss(validator.trim(req.body.email));
            password = xss(validator.trim(req.body.password));

            if (! uid || ! email || ! password) {
                res.json({
                    status: 0,
                    error: '请填写完整注册信息。'
                });
                return false;
            }

            if (! validator.isAlphanumeric(uid)) {
                res.json({
                    status: 0,
                    error: '用户名只能包含数字和字母。'
                });
                return false;
            }

            if (! validator.isEmail(email)) {
                res.json({
                    status: 0,
                    error: '请输入有效的邮箱。'
                });
                return false;
            }

            if (! validator.isLength(password, 6, 16)) {
                res.json({
                    status: 0,
                    error: '密码长度应该大于6位小于16位。'
                });
                return false;
            }

            hashedPwd = md5(password);
            hashedEmail = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

            User.getAllUser().then(function (users) {
                if (users.length <= 0) {
                    return User.createNewUser({
                        uid: uid,
                        email: email,
                        pwd: hashedPwd,
                        avatar: 'http://www.gravatar.com/avatar/' + hashedEmail,
                        role: 'admin'
                    });
                } else {
                    return User.checkExist(uid, email).then(function (users) {
                        if (users.length) {
                            return '';
                        } else {
                            return User.createNewUser({
                                uid: uid,
                                pwd: hashedPwd,
                                email: email,
                                avatar: 'http://www.gravatar.com/avatar/' + hashedEmail,
                                role: 'user'
                            });
                        }
                    });
                }
            }).then(function (user) {
                if (! user) {
                    res.json({
                        status: 0,
                        error: '该用户已经注册。'
                    });                    
                } else {

                    var dir = [
                        '/content/data/public/' + user.uid + '/upload', 
                        '/content/data/public/' + user.uid + '/gallery', 
                        '/content/data/private/' + user.uid + '/upload', 
                        '/content/data/private/' + user.uid + '/gallery',
                        '/content/data/trash/' + user.uid
                    ];

                    return dir.reduce(function (p, d) {
                        return p.then(function () {
                            log.success('create user folders:' + d);
                            return fsx.mkdirsAsync(root + d);
                        });
                    }, Promise.resolve()).then(function () {
                        res.json({
                            status: 1,
                            username: user.uid
                        });                    
                    });

                }
            }).then(null, function (err) {
                log.error(err.stack);
                res.json({
                    status: 0,
                    error: err.message
                });
            });
        });

        router.get(url.adminSignOut, function (req, res, next) {
            req.session.destroy();
            res.redirect(url.admin);
        });
    });
};

function readBgFolder () {
    return fs.readdirAsync(root + '/content/data/public/background').then(function (files) {
        var list = [];
        files.reduce(function (p, file) {
            return p.then(function () {
                return fs.statAsync(root + '/content/data/public/background/' + file).then(function (stat) {
                    if (stat.isFile()) {
                        list.push(file);
                    }
                });
            });
        }, Promise.resolve());

        return list;
    });
}


function md5 (password) {
    var salt = 'interesting',
        raw = crypto.createHash('md5').update(password+salt),
        result = raw.digest('hex');
    return result;
}