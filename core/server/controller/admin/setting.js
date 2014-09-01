var validator = require('validator'),
    xss = require('xss'),
    fs = require('fs'),
    auth_user = require('../../utils/auth_user'),
    errorHandling = require('../../utils/error'),
    Setting = require('../../models').Setting,
    config = require('../../../../config').config,
    locals = require('../../index');

module.exports = function (router) {
    router.get(config.url.adminSetting, auth_user, function (req, res, next) {
        if (req.session.user.role !== 'admin') {
            res.redirect(config.url.admin);
            return false;
        }
        fs.readdir(config.root_dir + '/content/themes', function (err, files) {
            var themes = [];
            if (err) {
                errorHandling(req, res, { error: err.code, type: 500});
                return false;
            }
            files.forEach(function (item,index) {
                var file = fs.statSync(config.root_dir + '/content/themes/' + item);
                if (file.isDirectory()) {
                    themes.push(item);
                }
            });
            res.render('admin_setting', { themes: themes });
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
        Setting.updateSetting(obj, function (err, s) {
            if (err) {
                res.json({
                    status: 0,
                    error: err
                });
                return false;
            }
            res.json({
                status: 1,
                error: ''
            });
            locals.setting = s;
        });
    });
};