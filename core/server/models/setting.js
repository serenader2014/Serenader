var mongoose = require('mongoose'),
    _ = require('underscore'),
    Schema = mongoose.Schema,
    Promise = require('bluebird'),

    SettingSchema = new Schema({
        name: String,
        desc: String,
        logo: String,
        favicon: String,
        allow_sign_up: { type: Boolean, default: true },
        theme: String,
        posts_per_page: { type: Number, default: 10 },
        id: String
    });


SettingSchema.statics.getSetting = function () {
    return this.findOne({id: 'blog'}).exec();
};

SettingSchema.statics.createSetting = function (options) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var setting = new self();
        _.extend(setting, options);
        setting.id = 'blog';
        setting.save(function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(setting);
            }
        });
    });
};

SettingSchema.statics.updateSetting = function (options) {
    var obj = {};
    _.extend(obj, options);

    return this.findOneAndUpdate({id: 'blog'}, obj).exec();
};

var Setting = module.exports = mongoose.model('Setting', SettingSchema);
