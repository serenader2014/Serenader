var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Setting = require('../../proxy').setting;
var config = require('../../config').config;
var validator = require('validator');
var xss = require('xss');

module.exports = function (router) {
    router.get('/settings', auth_user, function (req, res, next) {
        if (req.session.user.role !== 'admin') {
            res.redirect(adminPath);
        }
        Setting.getSetting(function (err, s) {
            if (err) console.error(err);
            if (s) {
                res.render('admin_setting', {adminPath: adminPath, locals: res.locals, setting: s});
            } else {
                var setting = {
                    name: config.name,
                    desc: config.description,
                    logo: config.site_logo,
                    favicon: config.site_icon,
                    nav: config.site_nav,
                    admin_path: config.admin_path,
                    allow_sign_up: config.allow_sign_up
                };
                res.render('admin_setting', {adminPath: adminPath, locals: res.locals, setting: setting});
            }
        });
    });

    router.post('/settings', auth_user, function (req, res, next) {
        if (req.session.user.role !== 'admin') {
            res.redirect(adminPath);
        }
        var name = validator.trim(xss(req.body.blog_title));
        var desc = validator.trim(xss(req.body.blog_desc));
        var logo = validator.trim(xss(req.body.blog_logo));
        var favicon = validator.trim(xss(req.body.blog_favicon));
        var nav = [req.body.blog_navs];
        var admin_path = req.body.blog_admin_path.substring(0,1) === '/' ?
                validator.trim(xss(req.body.blog_admin_path)) : validator.trim(xss('/'+req.body.blog_admin_path));
                
        var signup = validator.trim(xss(req.body.blog_signup));
        var obj = {
            name: name,
            desc: desc,
            logo: logo,
            favicon: favicon,
            nav: nav,
            admin_path: admin_path,
            allow_sign_up: signup
        };
        Setting.getSetting(function (err, s) {
            if (err) res.send(err);
            if (s) {
                Setting.updateSetting(obj, function (err) {
                    if (err) res.send(err);
                    adminPath = admin_path;
                    res.redirect(admin_path);
                    process.exit();
                }); 
            } else {
                Setting.createSetting(obj, function (err) {
                    if (err) res.send(err);
                    adminPath = admin_path;
                    res.redirect(admin_path);
                    process.exit();
                }); 
            }
        });
    });
};