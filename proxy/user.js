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
    User.update(
        {uid: uid}, 
        {uid: uid, 
            email: options.email, 
            pwd: options.pwd, 
            website: options.website, 
            profile_header: options.profile_header, 
            role: options.role, 
            signature: options.signature,
            avatar: options.avatar
        }, callback);
};


module.exports.deleteUserById = function (uid, callback) {
    User.remove({uid: uid}, callback);
};