var User = require('../models').User;

module.exports.getOneUserById = function (id, callback) {
    User.findOne({uid: id}, callback);
};

module.exports.getOneUserByEmail = function (email, callback) {
    User.findOne({email: email}, callback);
};

module.exports.getAllUser = function (callback) {
    User.find({}, callback);
};

module.exports.createNewUser = function (options, callback) {
    var user = new User();
    user.uid = options.uid;
    user.email = options.email;
    user.pwd = options.pwd;
    user.role = options.role;
    user.avatar = options.avatar;
    user.save(callback);
};

module.exports.updateUserProfile = function (options, callback) {
    var obj = {};
    if (options.email) { obj.email = options.email; }
    if (options.pwd) { obj.pwd = options.pwd; }
    if (options.website) { obj.website = options.website; }
    if (options.profile_header) { obj.profile_header = options.profile_header; }
    if (options.role) { obj.role = options.role; }
    if (options.avatar) { obj.avatar = options.avatar; }
    if (options.signature) { obj.signature = options.signature; }

    User.findOneAndUpdate({uid: options.uid}, obj, callback);
};


module.exports.deleteUserById = function (uid, callback) {
    User.findOneAndRemove({uid: uid}, callback);
};