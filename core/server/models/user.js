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
    return user.save();
};
UserSchema.statics.updateUserProfile = function (options, callback) {
    var obj = {};
    _.extend(obj, options);
    this.findOneAndUpdate({uid: options.uid}, obj, callback);
};
UserSchema.statics.deleteUserById = function (uid, callback) {
    this.findOneAndRemove({uid: uid}, callback);
};

var User = module.exports = mongoose.model('User', UserSchema);