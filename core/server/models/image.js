var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,

    Album = require('./album'),

    ImageSchema = new Schema({
        path: String,
        album: String,
        thumb: String,
        cover: Boolean,
        name: String
    });

ImageSchema.statics.create = function (options) {
    var img = new this();
    img.path = options.path;
    img.thumb = options.thumb;
    img.album = options.album;
    img.cover = options.cover;
    img.name = options.name;
    return img.saveAsync();
};
ImageSchema.statics.delete = function (id) {
    return this.findByIdAndRemoveAsync(id);
};

ImageSchema.statics.deleteByName = function (name) {
    return this.findOneAndRemoveAsync({name: name});
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