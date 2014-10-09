var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),

    UserSchema = new Schema({
        uid: { type: String , unique: true },
        email: { type: String , unique: true },
        pwd: { type: String },
        website: { type: String },
        profile_header: { type: String },
        avatar: { type: String },
        role: { type: String },
        signature: { type: String }
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
    var user = new this();
    user.uid = options.uid;
    user.email = options.email;
    user.pwd = options.pwd;
    user.role = options.role;
    user.avatar = options.avatar;
    user.save();
    return user;
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