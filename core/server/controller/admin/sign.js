var Promise   = require('bluebird');
var crypto    = require('crypto');
var fs        = Promise.promisifyAll(require('fs-extra'));
var xss       = require('xss');
var validator = require('validator');
var User      = require('../../models').User;
var Setting   = require('../../models').Setting;
var log       = require('../../utils/log')();
var config    = global.config;
var root      = config.root_dir;
var url       = config.url;
var locals    = require('../../index').locals;

function md5 (password) {
    var salt   = 'interesting';
    var raw    = crypto.createHash('md5').update(password+salt);

    return raw.digest('hex');
}

function createUser (uid, email, password) {

    if (! uid || ! email || ! password) {
        return Promise.reject({ret: -1,error: '请填写完整注册信息。'});
    }

    if (! validator.isAlphanumeric(uid)) {
        return Promise.reject({ret: -1,error: '用户名只能包含数字和字母。'});
    }

    if (! validator.isEmail(email)) {
        return Promise.reject({ret: -1,error: '请输入有效的邮箱。'});
    }

    if (! validator.isLength(password, 6, 16)) {
        return Promise.reject({ret: -1,error: '密码长度应该大于6位小于16位。'});
    }

    var hashedPwd = md5(password);

    return User.getAllUser().then(function (users) {
        if (users.length <= 0) {
            return User.create({uid: uid, email: email, pwd: hashedPwd,role: 'admin'});
        } else {
            return User.checkExist(uid, email).then(function (users) {
                if (users.length) {
                    return '';
                } else {
                    return User.create({uid: uid,pwd: hashedPwd,email: email,role: 'user'});
                }
            });
        }
    }).then(function (user) {
        if (!user) {
            return Promise.reject({ret: -1,error: '该用户已经注册。'});
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
                return user;
            });
        }
    });
}

module.exports = function (router) {

    router.post(url.setup, function (req, res, next) {
        if (global.initialized) {
            next();
            return false;
        }
        var username  = xss(validator.trim(req.body.username));
        var password  = xss(validator.trim(req.body.password));
        var blogTitle = xss(validator.trim(req.body.title));
        var blogDesc  = xss(validator.trim(req.body.description));
        var email     = xss(validator.trim(req.body.email));

        if (!username || !password || !blogTitle || !blogDesc || !email) {
            res.json({ret: -1, error: 'empty'});
            return false;
        }

        createUser(username, email, password).then(function (user) {
            console.log(user);
            req.session.user = user;
            return Setting.update({name: blogTitle, desc: blogDesc});
        }).then(function () {
            global.initialized = true;
            res.json({ret: 0});
        }).catch(function (err) {
            res.json(err);
        });

    });

    router.get(url.sign, function (req, res) {
        if (req.session.user) {
            res.redirect(url.admin);
        } else {
            res.render('sign');
        }
    });

    router.use(function (req, res, next) {
        if (global.initialized) {
            next();
        } else {
            res.redirect(url.admin + url.sign + '#/setup');
        }
    });

    router.post(url.signIn, function (req, res) {
        var username = xss(validator.trim(req.body.username));
        var password = xss(validator.trim(req.body.password));

        User.getOneUserById(username).then(function (user) {
            if (user) {
                if (user.pwd === md5(password)) {
                    req.session.user = user;
                    res.json({ret: 0, error: '', user: user.uid});
                } else {
                    res.json({ret: -1, error: '密码或用户名不正确！'});
                }
            } else {
                res.json({ret: -1, error: '该用户尚未注册！'});
            }
        });
    });

    router.post(url.signUp, function (req, res) {
        var uid, email, password;

        if (! locals.setting.allowSignUp) {
            res.json({ret: -1,error: '帐号注册功能已经被系统管理员禁用！'});
            return false;
        }

        uid      = validator.trim(req.body.username);
        email    = validator.trim(req.body.email);
        password = validator.trim(req.body.password);

        createUser(uid, email, password).then(function (user) {
            req.session.user = user;
            res.json({ret: 0, user: user.uid});
        }).catch(function (err) {
            res.json(err);
        });
        
    });

    router.get(url.signOut, function (req, res) {
        req.session.destroy();
        res.redirect(url.admin);
    });
};

