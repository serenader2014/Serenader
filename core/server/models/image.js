var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,

    Album = require('./album'),

    ImageSchema = new Schema({
        path: String,
        album: String,
        thumb: String,
        cover: Boolean
    });

ImageSchema.statics.create = function (options) {
    var img = new this();
    img.path = options.path;
    img.thumb = options.thumb;
    img.album = options.album;
    img.cover = options.cover;
    return img.saveAsync().then(function () {
        return Album.increaseCount(options.album);
    });
};
ImageSchema.statics.delete = function (id) {
    var self = this;
    return this.findByIdAsync(id).then(function (image) {
        return Album.decreaseCount(image.album);
    }).then(function () {
        return self.findByIdAndRemoveAsync(id);
    });
};

ImageSchema.statics.getAllImages = function () {
    return this.findAsync({});
};
ImageSchema.statics.update = function (options) {
    return this.findByIdAndUpdateAsync(options.id, {
        path: options.path,
        thumb: options.thumb,
        cover: options.cover
    });
};
ImageSchema.statics.findOneAlbumImage = function (name) {
    return this.findAsync({album: name});
};

var Image = module.exports = mongoose.model('Image', ImageSchema);