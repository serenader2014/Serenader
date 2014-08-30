var Setting = require('../models').Setting;

module.exports.getSetting = function (callback) {
    Setting.findOne({id: 'blog'}, callback);
};

module.exports.createSetting = function (options, callback) {
    var setting = new Setting();
    setting.id = 'blog';
    setting.name = options.name;
    setting.desc = options.desc;
    setting.logo = options.logo;
    setting.favicon = options.favicon;
    setting.nav = options.nav;
    setting.admin_path = options.admin_path;
    setting.allow_sign_up = options.allow_sign_up;
    setting.save(callback);
};

module.exports.updateSetting = function (options, callback) {
    var obj = {};
    if (options.name) { obj.name = options.name; }
    if (options.desc) { obj.desc = options.desc; }
    if (options.logo) { obj.logo = options.logo; }
    if (options.favicon) { obj.favicon = options.favicon; }
    if (options.nav) { obj.nav = options.nav; }
    if (options.admin_path) { obj.admin_path = options.admin_path; }
    if (options.allow_sign_up) { obj.allow_sign_up = options.allow_sign_up; }

    Setting.findOneAndUpdate({id: 'blog'}, obj, callback);
};