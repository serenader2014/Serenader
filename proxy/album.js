var Album = require('../models').Album;


module.exports.addAlbum = function (name, desc, private, cover, callback) {
    var album = new Album();
    album.name = name;
    album.desc = desc;
    album.private = private;
    album.cover = cover;
    album.save(callback);
};

module.exports.updateAlbum = function (id, name, desc, private, cover, callback) {
    Album.update({_id: id}, {_id: id, name: name, desc: desc, private: private}, callback);
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