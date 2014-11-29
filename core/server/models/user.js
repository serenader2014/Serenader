var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    _ = require('underscore'),

    UserSchema = new Schema({
        uid: { type: String , unique: true },
        email: { type: String , unique: true },
        pwd: String,
        website: String,
        profile_header: String,
        avatar: {type: String, default: '/core/view/assets/default_avatar.jpg'},
        role: String,
        signature: String
    });

UserSchema.statics.getOneUserById = function (id) {
    return this.findOneAsync({uid: id});
};
UserSchema.statics.getOneUserByEmail = function (email) {
    return this.findOneAsync({email: email});
};
UserSchema.statics.checkExist = function (id, email) {
    return this.find().or([{uid: id}, {email: email}]).exec();
};
UserSchema.statics.getAllUser = function () {
    return this.findAsync({});
};
UserSchema.statics.create = function (options) {
    var user = new this();
    user.uid = options.uid;
    user.email = options.email;
    user.pwd = options.pwd;
    user.role = options.role;
    user.avatar = options.avatar;
    return user.saveAsync().spread(function (user) {
        return user;
    });
};
UserSchema.statics.update = function (options) {
    var obj = {};
    _.extend(obj, options);
    return this.findOneAndUpdateAsync({uid: options.uid}, obj);
};
UserSchema.statics.delete = function (id) {
    return this.findOneAndRemoveAsync({id: id});
};

var User = module.exports = mongoose.model('User', UserSchema);