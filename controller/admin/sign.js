var crypto = require('crypto');
var fs = require('fs');
var xss = require('xss');
var request = require('request');
var fs = require('fs');

var validator = require('validator');
var adminPath = require('./index').adminPath;
var User = require('../../proxy').user;
var errorHandling = require('../../routes').error;
var makeFolder = require('../../app').makeFolder;

var root = require('../../config').config.root_dir;

module.exports = function (router) {
    var bg;
    if (list.length === 0) {
        bg = '/img/default_background.jpg';
    } else {
        bg = list[Math.floor(Math.random()*list.length)];
    }

    router.get('/signin', function (req, res, next) { 
        if (res.locals.current_user) {
            res.redirect(adminPath);
        } else {
            res.render('signin', {background: bg});
        }
    });


    router.post('/signin', function (req, res, next) {
        var email = xss(validator.trim(req.body.email));
        var password = xss(validator.trim(req.body.password));

        if (! validator.isEmail(email)) {
            res.render('signin', {error: '请输入有效的邮箱。',background: bg});
        }

        User.getOneUserByEmail(email, function(err, u) {
            if (err) {
                errorHandling(req, res, { error: err, type: 500});
                return false;
            }
            if (u) {
                if (u.pwd === md5(password)) {
                    req.session.user = u;
                    res.redirect(adminPath);
                } else {
                    errorHandling(req, res, { error: 'incorrect password.', type: 403});
                    return false;
                }
            } else {
                errorHandling(req, res, { error: 'User does not exist.',  type: 401});
                return false;
            }
        });
    });

    router.get('/signup', function (req, res, next) {
        if (res.locals.current_user) {
            res.redirect(adminPath);
        } else {
            res.render('signup', {background: bg});
        }
    });

    router.post('/signup', function (req, res, next) {
        var uid = xss(validator.trim(req.body.id));
        var email = xss(validator.trim(req.body.email));
        var password = xss(validator.trim(req.body.password));

        if (! uid || ! email || ! password) {
            res.render('signup', {error: '请填写完整注册信息。',background: bg});
            return false;
        }

        if (! validator.isAlphanumeric(uid)) {
            res.render('signup', {error: '用户名只能包含数字和字母。',background: bg});
            return false;
        }

        if (! validator.isEmail(email)) {
            res.render('signup', {error: '请输入有效的邮箱。',background: bg});
            return false;
        }

        if (! validator.isLength(password, 6, 16)) {
            res.render('signup', {error: '密码长度应该大于6位小于16位。',background: bg});
            return false;
        }

        var hashedPwd = md5(password);
        var hashedEmail = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

        var avatar = 'http://www.gravatar.com/avatar/'+hashedEmail;

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
                        errorHandling(req, res, { error: err, type: 500});
                        return false;
                    }
                    res.json({
                        status: 1,
                        username: uid
                    });
                    makeFolder([
                        '/data/public/' + uid + '/upload', 
                        '/data/public/' + uid + '/gallery', 
                        '/data/private/' + uid + '/upload', 
                        '/data/private/' + uid + '/gallery'
                    ], function () {
                        downloadAvatar(hashedPwd, '/data/public/' + uid + '/avatar.jpg', function () {
                            console.log('Avatar download success.');
                        });
                    });
                });
            } else {
                User.getOneUserById(uid, function (err, user) {
                    if (err) { 
                        errorHandling(req, res, { error: err, type: 500});
                        return false;
                    }
                    if (! user) {
                        User.getOneUserByEmail(email, function (err, u) {
                            if (err) { 
                                errorHandling(req, res, { error: err, type: 500});
                                return false;
                            }
                            if (! u) {
                                User.createNewUser({
                                    uid: uid,
                                    pwd: hashedPwd,
                                    email: email,
                                    avatar: avatar,
                                    role: 'user'
                                }, function (err) {
                                    if (err) {
                                        errorHandling(req, res, { error: err, type: 500});
                                        return false;
                                    }
                                    res.json({
                                        status: 1,
                                        username: uid
                                    });
                                    makeFolder([
                                        '/data/public/' + uid + '/upload', 
                                        '/data/public/' + uid + '/gallery', 
                                        '/data/private/' + uid + '/upload', 
                                        '/data/private/' + uid + '/gallery'
                                    ], function () {
                                        downloadAvatar(hashedPwd, '/data/public/' + uid + '/avatar.jpg', function () {
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


    router.get('/signout', function (req, res, next) {
        req.session.destroy();
        res.redirect(adminPath);
    });
};


var list = [];
(function randomBackground () {
    fs.stat(root + '/data', function (err, stats) {
        if (err && err.code === 'ENOENT') {
            fs.mkdirSync(root + '/data');
        }
        fs.stat(root + '/data/public', function (err, stats) {
            if (err && err.code === 'ENOENT') {
                fs.mkdirSync(root + '/data/public');
            }
            fs.stat(root + '/data/public/background', function (err, stats) {
                if (err && err.code === 'ENOENT') {
                    fs.mkdirSync(root + '/data/public/background');
                }
                fs.readdir(root + '/data/public/background', function (err, f) {
                    f.forEach(function (item, index) {
                        list.push(item);
                    });
                });
            });
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
    var url = 'http://www.gravatar.com/avatar/' + hashedEmail;
    fileName = root + fileName;
    request.head(url).pipe(fs.createWriteStream(fileName)).on('close', callback);
}