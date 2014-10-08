var Promise = require('bluebird'),
    crypto = require('crypto'),
    fs = Promise.promisifyAll(require('fs')),
    mkdir = Promise.promisifyAll(require('mkdirp')),
    xss = require('xss'),
    validator = require('validator'),
    User = require('../../models').User,
    errorHandling = require('../../utils/error'),
    root = require('../../../../config').config.root_dir,
    url = require('../../../../config').config.url,
    locals = require('../../index').locals;

module.exports = function (router) {

    readBgFolder().then(function (list) {
        var bg;
        if (list.length === 0) {
            bg = '/img/default_background.jpg';
        } else {
            bg = list[Math.floor(Math.random()*list.length)];
        }
        return bg;
    }).then(function (bg) {

        router.get(url.adminSignIn, function (req, res, next) { 
            if (req.session.user) {
                res.redirect(url.admin);
            } else {
                res.render('signin', {
                    background: bg, 
                    referer: req.headers.referer || url.admin + '/' + url.adminSignIn
                });
            }
        });

        router.post(url.adminSignIn, function (req, res, next) {
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

            User.getAllUser().addCallback(function (users) {
                if (users.length <= 0) {
                    return User.createNewUser({
                        uid: uid,
                        email: email,
                        pwd: hashedPwd,
                        avatar: '/static/' + uid + '/avatar.jpg',
                        role: 'admin'
                    });
                } else {
                    return User.getOneUserById(uid).then(function (user) {
                        var u;
                        if (! user) {
                            User.getOneUserByEmail(email).then(function (user) {
                                if (! user) {
                                    u = undefined;
                                } else {
                                    u = user;
                                }
                                return u;
                            });
                        } else {
                            u = user;
                            return u;
                        }
                    }).then(function (user) {
                        if (! user) {
                            return User.createNewUser({
                                uid: user.uid,
                                pwd: hashedPwd,
                                email: email,
                                avatar: '/static/' + user.uid + '/avatar.jpg',
                                role: 'user'
                            });                                
                        } else {
                            return ;
                        }
                    });
                }
            }).then(function (user) {
                if (! user) {
                    res.json({
                        status: 0,
                        error: '该用户名已经被注册，请输入新的用户名。'
                    });                    
                } else {
                    console.log(user);
                    var dir = [
                        '/content/data/public/' + user.uid + '/upload', 
                        '/content/data/public/' + user.uid + '/gallery', 
                        '/content/data/private/' + user.uid + '/upload', 
                        '/content/data/private/' + user.uid + '/gallery'                    
                    ];

                    dir.reduce(function (p, d) {
                        return p.then(function () {
                            return mkdir.mkdirpAsync(d);
                        });
                    }, Promise.resolve());

                    res.json({
                        status: 1,
                        username: user.uid
                    });                    
                }
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
    var salt = 'interesting';
    var raw = crypto.createHash('md5').update(password+salt);
    var result = raw.digest('hex');
    return result;
}

// function downloadAvatar (hashedEmail, fileName, callback) {
//     var url = 'http://www.gravatar.com/avatar/' + hashedEmail + '?s=400';
//     fileName = root + fileName;
//     request(url).pipe(fs.createWriteStream(fileName)).on('close', callback);
// }