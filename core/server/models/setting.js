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


SettingSchema.statics.getSetting = function () {
    return this.findOne({id: 'blog'}).exec();
};

SettingSchema.statics.createSetting = function (options) {
    var setting = new this();
    _.extend(setting, options);
    setting.id = 'blog';
    setting.save();
    return setting;
};

SettingSchema.statics.updateSetting = function (options) {
    var obj = {};
    _.extend(obj, options);

    return this.findOneAndUpdate({id: 'blog'}, obj);
};

var Setting = module.exports = mongoose.model('Setting', SettingSchema);
