var Promise = require('bluebird'),
    crypto = require('crypto'),
    fs = Promise.promisifyAll(require('fs-extra')),
    xss = require('xss'),
    validator = require('validator'),
    User = require('../../models').User,
    log = require('../../utils/log')(),
    config = require('../../../../config').config,
    root = config.root_dir,
    url = config.url,
    locals = require('../../index').locals;

function md5 (password) {
    var salt = 'interesting',
        raw = crypto.createHash('md5').update(password+salt),
        result = raw.digest('hex');
    return result;
}

module.exports = function (router) {
        // router handler

    router.get(url.sign, function (req, res) { 
        if (req.session.user) {
            res.redirect(url.admin);
        } else {
            res.render('sign');
        }
    });

    router.post(url.signIn, function (req, res) {
        var username = xss(validator.trim(req.body.username)),
            password = xss(validator.trim(req.body.password));

        User.getOneUserById(username).then(function (user) {
            if (user) {
                if (user.pwd === md5(password)) {
                    req.session.user = user;
                    res.json({
                        ret: 0, error: '', user: user.uid
                    });
                } else {
                    res.json({
                        ret: -1, error: '密码或用户名不正确！'
                    });
                }
            } else {
                res.json({
                    ret: -1, error: '该用户尚未注册！'
                });
            }
        });
    });

    router.post(url.signUp, function (req, res) {
        var uid, email, password, rePwd, hashedPwd;
        
        if (! locals.setting.allow_sign_up) {
            res.json({
                ret: -1,
                error: '帐号注册功能已经被系统管理员禁用！'
            });
            return false;
        }
        uid = validator.trim(req.body.id);
        email = validator.trim(req.body.email);
        password = validator.trim(req.body.password);
        rePwd = validator.trim(req.body.rePwd);

        if (! uid || ! email || ! password || ! rePwd) {
            res.json({
                ret: -1,
                error: '请填写完整注册信息。'
            });
            return false;
        }

        if (! validator.isAlphanumeric(uid)) {
            res.json({
                ret: -1,
                error: '用户名只能包含数字和字母。'
            });
            return false;
        }

        if (! validator.isEmail(email)) {
            res.json({
                ret: -1,
                error: '请输入有效的邮箱。'
            });
            return false;
        }

        if (! validator.isLength(password, 6, 16)) {
            res.json({
                ret: -1,
                error: '密码长度应该大于6位小于16位。'
            });
            return false;
        }

        if (password !== rePwd) {
            res.json({
                ret: -1,
                error: '两次输入的密码不一致！'
            });
            return false;
        }

        hashedPwd = md5(password);

        User.getAllUser().then(function (users) {
            if (users.length <= 0) {
                return User.createNewUser({
                    uid: uid,
                    email: email,
                    pwd: hashedPwd,
                    avatar: config.assetsUrl.serverSideAssets + '/default_avatar.jpg',
                    role: 'admin'
                });
            } else {
                return User.checkExist(uid, email).then(function (users) {
                    if (users.length) {
                        return '';
                    } else {
                        return User.create({
                            uid: uid,
                            pwd: hashedPwd,
                            email: email,
                            avatar: config.assetsUrl.serverSideAssets + '/default_avatar.jpg',
                            role: 'user'
                        });
                    }
                });
            }
        }).then(function (user) {
            if (! user) {
                res.json({
                    ret: -1,
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
                        return fs.mkdirsAsync(root + d);
                    });
                }, Promise.resolve()).then(function () {
                    res.json({
                        ret: 0,
                        username: user.uid
                    });                    
                });

            }
        }).then(null, function (err) {
            log.error(err.stack);
            res.json({
                ret: -1,
                error: err.message
            });
        });
    });

    router.get(url.signOut, function (req, res) {
        req.session.destroy();
        res.redirect(url.admin);
    });
};

