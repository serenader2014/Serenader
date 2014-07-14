var Setting = require('../models').Setting;

module.exports.getSetting = function (callback) {
    Setting.findOne({id: 'blog'}, callback);
};

module.exports.createSetting = function (name, desc, logo, favcon, nav, admin_path, allow_sign_up, callback) {
    var setting = new Setting();
    setting.id = 'blog';
    setting.name = name;
    setting.desc = desc;
    setting.logo = logo;
    setting.favcon = icon;
    setting.nav = nav;
    setting.admin_path = admin_path;
    setting.allow_sign_up = allow_sign_up;
    setting.save(callback);
};

module.exports.updateSetting = function (name, desc, logo, favcon, nav, admin_path, allow_sign_up, callback) {
    Setting.findOne({id: 'blog'}, function (err, s) {
        if (err || !s) {
            return callback(err);
        }
        s.name = name;
        s.desc = desc;
        s.logo = logo;
        s.favcon = favcon;
        s.nav = nav;
        s.admin_path = admin_path;
        s.allow_sign_up = allow_sign_up;
        s.save(callback);
    });
};