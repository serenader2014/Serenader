var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    _ = require('lodash'),
    Schema = mongoose.Schema,

    SettingSchema = new Schema({
        name: String,
        desc: String,
        logo: String,
        favicon: String,
        allowSignUp: { type: Boolean, default: true },
        theme: String,
        postsPerPage: { type: Number, default: 10 },
        id: String
    });


SettingSchema.statics.getSetting = function () {
    return this.findOneAsync({id: 'blog'});
};

SettingSchema.statics.create = function (options) {
    var setting = new this();
    _.extend(setting, options);
    setting.id = 'blog';
    return setting.saveAsync().spread(function (setting) {
        return setting;
    });
};

SettingSchema.statics.update = function (options) {
    var obj = {};
    _.extend(obj, options);

    return this.findOneAndUpdateAsync({id: 'blog'}, obj);
};

var Setting = module.exports = mongoose.model('Setting', SettingSchema);
