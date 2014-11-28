var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    _ = require('underscore'),
    Schema = mongoose.Schema,

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
    return this.findOneAsync({id: 'blog'});
};

SettingSchema.statics.create = function (options) {
    var setting = new this();
    _.extend(setting, options);
    setting.id = 'blog';
    return setting.saveAsync();
};

SettingSchema.statics.update = function (options) {
    var obj = {};
    _.extend(obj, options);

    return this.findOneAndUpdateAsync({id: 'blog'}, obj);
};

var Setting = module.exports = mongoose.model('Setting', SettingSchema);
