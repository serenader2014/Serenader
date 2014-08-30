var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SettingSchema = new Schema({
    name: { type: String },
    desc: { type: String },
    logo: { type: String },
    favicon: { type: String },
    nav: { type: Array },
    allow_sign_up: { type: Boolean },
    theme: { type: String },
    id: { type: String }
});


SettingSchema.statics.getSetting = function (callback) {
    this.findOne({id: 'blog'}, callback);
};

SettingSchema.statics.createSetting = function (options, callback) {
    var setting = new this();
    setting.id = 'blog';
    setting.name = options.name;
    setting.desc = options.desc;
    setting.logo = options.logo;
    setting.favicon = options.favicon;
    setting.nav = options.nav;
    setting.allow_sign_up = options.allow_sign_up;
    setting.save(callback);
};

SettingSchema.statics.updateSetting = function (options, callback) {
    var obj = {};
    if (options.name) { obj.name = options.name; }
    if (options.desc) { obj.desc = options.desc; }
    if (options.logo) { obj.logo = options.logo; }
    if (options.favicon) { obj.favicon = options.favicon; }
    if (options.nav) { obj.nav = options.nav; }
    if (options.allow_sign_up) { obj.allow_sign_up = options.allow_sign_up; }

    this.findOneAndUpdate({id: 'blog'}, obj, callback);
};

var Setting = module.exports = mongoose.model('Setting', SettingSchema);
