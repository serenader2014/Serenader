var Image = require('../models').Image;
var Album = require('./album');

module.exports.addImage = function (options, callback) {
    var img = new Image();
    img.path = options.path;
    img.desc = options.desc;
    img.album = options.album;
    Album.increaseCount(options.album);
    img.save(callback);
};

module.exports.deleteImage = function (id, callback) {
    Image.findOneById(id, function (err, i) {
        if (err) {
            console.error(err);
        }
        if (i) {
            Album.decreaseCount(i.album);
            Image.findByIdAndRemove(id, callback);
        }
    }); 
};

module.exports.getAllImages = function (callback) {
    Image.find({}, callback);
};

module.exports.updateImage = function (options, callback) {
    Image.findByIdAndUpdate(id, {
        path: options.path,
        desc: options.desc
    }, callback);
};

module.exports.findOneAlbumImage = function (name, callback) {
    Image.find({album: name}, callback);
};