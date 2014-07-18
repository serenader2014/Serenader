var Album = require('../models').Album;


module.exports.addAlbum = function (name, desc, private, callback) {
    var album = new Album();
    album.name = name;
    album.desc = desc;
    album.private = private;
    album.save(callback);
};

module.exports.updateAlbum = function (id, name, desc, private, callback) {
    Album.update({_id: id}, {_id: id, name: name, desc: desc, private: private}, callback);
};

module.exports.deleteAlbum = function (id, callback) {
    Album.findByIdAndRemove(id, callback);
};

module.exports.getAllAlbum = function (callback) {
    Album.find({}, callback);
};