var Album = require('../models').Album;


module.exports.addAlbum = function (options, callback) {
    var album = new Album();
    album.name = options.name;
    album.desc = options.desc;
    album.user = options.user;
    album.private = options.private;
    album.cover = options.cover;
    album.count = 0;
    album.save(callback);
};

module.exports.updateAlbum = function (options, callback) {
    var obj = {};
    if (options.name) { obj.name = options.name; }
    if (options.desc) { obj.desc = options.desc; }
    if (options.user) { obj.user = options.user; }
    if (options.private) { obj.private = options.private; }

    Album.findByIdAndUpdate(options.id, obj, callback);
};

module.exports.deleteAlbum = function (id, callback) {
    Album.findByIdAndRemove(id, callback);
};

module.exports.getAllAlbum = function (callback) {
    Album.find({}, callback);
};

module.exports.getOneAlbum = function (name, callback) {
    Album.findOne({name: name}, callback);
};

module.exports.getPublicAlbum = function (callback) {
    Album.find({}).nor([{private: true}]).exec(callback);
};

module.exports.getUserAllAlbum = function (user, callback) {
    Album.find({user: user}, callback);
};

module.exports.getUserPublicAlbum = function (user, callback) {
    Album.find({user: user}).nor([{private: true}]).exec(callback);
};

module.exports.increaseCount = function (name) {
    Album.find({name: name}, function (err, a) {
        if (err) {
            console.error(err);
            return false;
        }
        if (a) {
            Album.findByIdAndUpdate({name: name}, {
                count: a.count + 1
            });
        }
    });
};

module.exports.decreaseCount = function (name) {
    Album.find({name: name}, function (err, a) {
        if (err) {
            console.error(err);
            return false;
        }
        if (a) {
            Album.findByIdAndUpdate({name: name}, {
                count: a.count - 1
            });
        }
    });
};