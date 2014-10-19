var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    Promise = require('bluebird'),

    UserSchema = new Schema({
        uid: { type: String , unique: true },
        email: { type: String , unique: true },
        pwd: String,
        website: String,
        profile_header: String,
        avatar: String,
        role: String,
        signature: String
    });

UserSchema.statics.getOneUserById = function (id) {
    return this.findOne({uid: id}).exec();
};
UserSchema.statics.getOneUserByEmail = function (email) {
    return this.findOne({email: email}).exec();
};
UserSchema.statics.checkExist = function (id, email) {
    return this.find().or([{uid: id}, {email: email}]).exec();
};
UserSchema.statics.getAllUser = function () {
    return this.find({}).exec();
};
UserSchema.statics.createNewUser = function (options) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var user = new self();
        user.uid = options.uid;
        user.email = options.email;
        user.pwd = options.pwd;
        user.role = options.role;
        user.avatar = options.avatar;
        user.save(function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });
    });
};
UserSchema.statics.updateUserProfile = function (options) {
    var obj = {};
    _.extend(obj, options);
    return this.findOneAndUpdate({uid: options.uid}, obj).exec();
};
UserSchema.statics.deleteUserById = function (uid) {
    return this.findOneAndRemove({uid: uid}).exec();
};

var User = module.exports = mongoose.model('User', UserSchema);