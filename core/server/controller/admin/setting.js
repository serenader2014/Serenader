var validator = require('validator'),
    xss = require('xss'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    auth_user = require('../../utils/auth_user'),
    errorHandling = require('../../utils/error'),
    Setting = require('../../models').Setting,
    config = require('../../../../config').config,
    locals = require('../../index').locals;

module.exports = function (router) {
    router.get(config.url.adminSetting, auth_user, function (req, res, next) {
        if (req.session.user.role !== 'admin') {
            res.redirect(config.url.admin);
            return false;
        }
        fs.readdirAsync(config.root_dir + '/content/themes').then(function (files) {
            var themes = [];
            files.reduce(function (p, item) {
                return p.then(function () {
                    return fs.statAsync(config.root_dir + '/content/themes/' + item).then(function (stat) {
                        if (stat.isDirectory()) {
                            themes.push(item);
                        }
                    });
                });
            }, Promise.resolve()).then(function () {
                res.render('admin_setting', { themes: themes });
            });
        }).then(null, function (err) {
            errorHandling(req, res, { error: err.message, type: 500 });
        });
    });

    router.post(config.url.adminSetting, auth_user, function (req, res, next) {
        var name, desc, logo, favicon, signup, theme, obj;

        if (req.session.user.role !== 'admin') {
            res.redirect(config.url.admin);
            return false;
        }
        name = validator.trim(xss(req.body.name));
        desc = validator.trim(xss(req.body.desc));
        logo = validator.trim(xss(req.body.logo));
        favicon = validator.trim(xss(req.body.favicon));
        signup = validator.trim(xss(req.body.signup));
        theme = validator.trim(xss(req.body.theme));
        num = validator.trim(xss(req.body.num));
        obj = {
            name: name,
            desc: desc,
            logo: logo,
            favicon: favicon,
            allow_sign_up: signup,
            theme: theme,
            posts_per_page: num
        };
        console.log(obj);
        Setting.updateSetting(obj).then(function (s) {
            res.json({
                status: 1,
                error: ''
            });
            locals.setting = s;
        }).then(null, function (err) {
            res.json({
                status: 0,
                error: err.message
            });
        });
    });
};