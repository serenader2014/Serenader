var crypto = require('crypto'),
    fs = require('fs'),
    xss = require('xss'),
    request = require('request'),
    validator = require('validator'),
    User = require('../../models').User,
    errorHandling = require('../../utils/error'),
    makeFolder = require('../../utils/makefolder'),
    root = require('../../../../config').config.root_dir,
    url = require('../../../../config').config.url,
    locals = require('../../index');

module.exports = function (router) {
    var bg;
    if (list.length === 0) {
        bg = '/img/default_background.jpg';
    } else {
        bg = list[Math.floor(Math.random()*list.length)];
    }

    router.get(url.adminSignIn, function (req, res, next) { 
        if (req.session.user) {
            res.redirect(url.admin);
        } else {
            res.render('signin', {background: bg, referer: req.headers.referer || url.admin + '/' + url.adminSignIn});
        }
    });


    router.post(url.adminSignIn, function (req, res, next) {
        var username = xss(validator.trim(req.body.username)),
            password = xss(validator.trim(req.body.password));
        User.getOneUserById(username, function(err, u) {
            if (err) {
                res.json({
                    status: 0,
                    error: err
                });
                return false;
            }
            if (u) {
                if (u.pwd === md5(password)) {
                    req.session.user = u;
                    res.json({
                        status: 1,
                        error: '',
                        user: u.uid
                    });
                } else {
                    res.json({
                        status: 0,
                        error: '密码或用户名不正确！'
                    });
                    return false;
                }
            } else {
                res.json({
                    status: 0,
                    error: '密码或用户名不正确！'
                });
                return false;
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

        User.getAllUser(function (err, users) {
            if (users.length <= 0) {
                User.createNewUser({
                    uid: uid,
                    email: email,
                    pwd: hashedPwd,
                    avatar: '/static/' + uid + '/avatar.jpg',
                    role: 'admin'
                }, function (err) {
                    if (err) {
                        res.json({
                            status: 0,
                            error: err
                        });
                        return false;
                    }
                    res.json({
                        status: 1,
                        username: uid,
                    });
                    makeFolder([
                        '/content/data/public/' + uid + '/upload', 
                        '/content/data/public/' + uid + '/gallery', 
                        '/content/data/private/' + uid + '/upload', 
                        '/content/data/private/' + uid + '/gallery'
                    ], function () {
                        downloadAvatar(hashedEmail, '/content/data/public/' + uid + '/avatar.jpg', function () {
                            console.log('Avatar download success.');
                        });
                    });
                });
            } else {
                User.getOneUserById(uid, function (err, user) {
                    if (err) { 
                        res.json({
                            status: 0,
                            error: err
                        });
                        return false;
                    }
                    if (! user) {
                        User.getOneUserByEmail(email, function (err, u) {
                            if (err) { 
                                res.json({
                                    status: 0,
                                    error: err
                                });
                                return false;
                            }
                            if (! u) {
                                User.createNewUser({
                                    uid: uid,
                                    pwd: hashedPwd,
                                    email: email,
                                    avatar: '/static/' + uid + '/avatar.jpg',
                                    role: 'user'
                                }, function (err) {
                                    if (err) {
                                        res.json({
                                            status: 0,
                                            error: err
                                        });
                                        return false;
                                    }
                                    res.json({
                                        status: 1,
                                        username: uid
                                    });
                                    makeFolder([
                                        '/content/data/public/' + uid + '/upload', 
                                        '/content/data/public/' + uid + '/gallery', 
                                        '/content/data/private/' + uid + '/upload', 
                                        '/content/data/private/' + uid + '/gallery'
                                    ], function () {
                                        downloadAvatar(hashedPwd, '/content/data/public/' + uid + '/avatar.jpg', function () {
                                            console.log('Avatar download success.');
                                        });
                                    });                                    
                                });
                            } else {
                                res.json({
                                    status: 0,
                                    error: '该Email已经被注册。请输入新的Email地址。'
                                });
                            }
                        });
                    } else {
                        res.json({
                            status: 0,
                            error: '该用户名已经被注册，请输入新的用户名。'
                        });
                    }
                });
            }
        });           
    });


    router.get(url.adminSignOut, function (req, res, next) {
        req.session.destroy();
        res.redirect(url.admin);
    });
};


var list = [];
(function randomBackground () {
    fs.readdir(root + '/content/data/public/background', function (err, f) {
        f.forEach(function (item, index) {
            list.push(item);
        });
    });
})();


function md5 (password) {
    var salt = 'interesting';
    var raw = crypto.createHash('md5').update(password+salt);
    var result = raw.digest('hex');
    return result;
}

function downloadAvatar (hashedEmail, fileName, callback) {
    var url = 'http://www.gravatar.com/avatar/' + hashedEmail + '?s=400';
    fileName = root + fileName;
    request(url).pipe(fs.createWriteStream(fileName)).on('close', callback);
}