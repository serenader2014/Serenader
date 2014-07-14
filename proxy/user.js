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

module.exports.updateUserProfileById = function (uid, email, pwd, website, profile_header, avatar, role, signature, callback) {
    User.find({uid: uid}, function (err, u) {
        if (err) {
            callback(err);
        } else {
            u.email = email;
            u.pwd = pwd;
            u.website = website;
            u.profile_header = profile_header;
            u.avatar = avatar;
            u.role = role;
            u.signature = signature;
            u.save(function (err) {
                if (err) callback(err);
            });
        }
    });
};

module.exports.updateUserProfileByEmail = function (uid, email, pwd, website, profile_header, avatar, role, signature, callback) {
    User.find({email: email}, function (err, u) {
        if (err) {
            callback(err);
        } else {
            u.email = email;
            u.pwd = pwd;
            u.website = website;
            u.profile_header = profile_header;
            u.avatar = avatar;
            u.role = role;
            u.signature = signature;
            u.save(function (err) {
                if (err) callback(err);
            });
        }        
    });
};

module.exports.deleteUserById = function (uid, callback) {
    User.find({uid: uid}, function (err, u) {
        if (err) {
            callback(err);
        } else {
            // TODO
        }
    })
}