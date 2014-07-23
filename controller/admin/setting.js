var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Setting = require('../../proxy').setting;
var config = require('../../config').config;

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
        var name = req.body.blog_title,
            desc = req.body.blog_desc,
            logo = req.body.blog_logo,
            favicon = req.body.blog_favicon,
            nav = [req.body.blog_navs],
            admin_path = req.body.blog_admin_path.substring(0,1) === '/' ? 
                req.body.blog_admin_path : '/'+req.body.blog_admin_path,
                
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
};