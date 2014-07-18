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

module.exports.createNewUser = function (uid, email, pwd, role, callback) {
    var user = new User();
    user.uid = uid;
    user.email = email;
    user.pwd = pwd;
    user.role = role;
    user.save(callback);
};

module.exports.updateUserProfile = function (uid, email, pwd, website, profile_header, role, signature, callback) {
    User.update(
        {uid: uid}, 
        {uid: uid, email: email, pwd: pwd, website: website, profile_header: profile_header, role: role, signature: signature}, 
        callback);
};


module.exports.deleteUserById = function (uid, callback) {
    User.remove({uid: uid}, callback);
};