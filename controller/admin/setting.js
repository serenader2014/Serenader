var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Setting = require('../../proxy').setting;

module.exports = function (router) {
    router.get('/settings', auth_user, function (req, res, next) {
        Setting.getSetting(function (err, s) {
            if (err) console.error(err);
            if (s) {
                res.render('admin_setting', {adminPath: adminPath, locals: res.locals, setting: s});
            } else {
                var setting = {name:'',desc:'',logo:'',favicon:'',nav:'',admin_path:'/admin',allow_sign_up:false};
                res.render('admin_setting', {adminPath: adminPath, locals: res.locals, setting: setting});
            }
        });
    });

    router.post('/settings', auth_user, function (req, res, next) {
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