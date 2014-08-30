var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    uid: { type: String , unique: true },
    email: { type: String , unique: true },
    pwd: { type: String },
    website: { type: String },
    profile_header: { type: String },
    avatar: { type: String },
    role: { type: String },
    signature: { type: String }
});

UserSchema.statics.getOneUserById = function (id, callback) {
    this.findOne({uid: id}, callback);
};
UserSchema.statics.getOneUserByEmail = function (email, callback) {
    this.findOne({email: email}, callback);
};
UserSchema.statics.getAllUser = function (callback) {
    this.find({}, callback);
};
UserSchema.statics.createNewUser = function (options, callback) {
    var user = new this();
    user.uid = options.uid;
    user.email = options.email;
    user.pwd = options.pwd;
    user.role = options.role;
    user.avatar = options.avatar;
    user.save(callback);
};
UserSchema.statics.updateUserProfile = function (options, callback) {
    var obj = {};
    if (options.email) { obj.email = options.email; }
    if (options.pwd) { obj.pwd = options.pwd; }
    if (options.website) { obj.website = options.website; }
    if (options.profile_header) { obj.profile_header = options.profile_header; }
    if (options.role) { obj.role = options.role; }
    if (options.avatar) { obj.avatar = options.avatar; }
    if (options.signature) { obj.signature = options.signature; }

    this.findOneAndUpdate({uid: options.uid}, obj, callback);
};
UserSchema.statics.deleteUserById = function (uid, callback) {
    this.findOneAndRemove({uid: uid}, callback);
};

var User = module.exports = mongoose.model('User', UserSchema);