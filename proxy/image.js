var Image = require('../models').Image;

module.exports.addImage = function (path, desc, album, callback) {
    var img = new Image();
    img.path = path;
    img.desc = desc;
    img.album = album;
    img.save(callback);
};

module.exports.deleteImage = function (id, callback) {
    Image.findByIdAndRemove(id, callback);
};

module.exports.getAllImages = function (callback) {
    Image.find({}, callback);
};

module.exports.updateImage = function (id, path, desc, callback) {
    Image.update(
        {_id: id}, 
        {_id: id, path: path, desc: desc},
        callback);
};

module.exports.findOneAlbumImage = function (name, callback) {
    Image.find({album: name}, callback);
};