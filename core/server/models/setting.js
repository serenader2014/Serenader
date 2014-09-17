var mongoose = require('mongoose'),
    _ = require('underscore'),
    Schema = mongoose.Schema,

    SettingSchema = new Schema({
        name: { type: String },
        desc: { type: String },
        logo: { type: String },
        favicon: { type: String },
        allow_sign_up: { type: Boolean },
        theme: { type: String },
        posts_per_page: { type: Number },
        id: { type: String }
    });


SettingSchema.statics.getSetting = function (callback) {
    this.findOne({id: 'blog'}, callback);
};

SettingSchema.statics.createSetting = function (options, callback) {
    var setting = new this();
    _.extend(setting, options);
    setting.id = 'blog';
    setting.save(callback);
};

SettingSchema.statics.updateSetting = function (options, callback) {
    var obj = {};
    _.extend(obj, options);

    this.findOneAndUpdate({id: 'blog'}, obj, callback);
};

var Setting = module.exports = mongoose.model('Setting', SettingSchema);
