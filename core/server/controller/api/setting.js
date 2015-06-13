var validator = require('validator');
var Setting   = require('../../models').Setting;
var config    = global.config;

module.exports = function (router) {

    router.post(config.url.setting, function (req, res) {
        var name, desc, logo, favicon, signup, theme, obj, num;

        if (!req.session.user || req.session.user.role !== 'admin') {
            res.json({error: '权限不足。'});
            return false;
        }
        name = validator.trim(req.body.name);
        desc = validator.trim(req.body.desc);
        logo = validator.trim(req.body.logo);
        favicon = validator.trim(req.body.favicon);
        signup = validator.trim(req.body.signup);
        theme = validator.trim(req.body.theme);
        num = validator.trim(req.body.num);
        obj = {
            name: name,
            desc: desc,
            logo: logo,
            favicon: favicon,
            allow_sign_up: signup,
            theme: theme,
            posts_per_page: num
        };
        Setting.update(obj).then(function (s) {
            res.json({ret: 0});
            global.setting = s;
        }).catch(function (err) {
            res.json({ret: -1,error: err.message});
        });
    });
};