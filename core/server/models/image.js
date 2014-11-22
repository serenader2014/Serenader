var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird'),

    Album = require('./album'),

    ImageSchema = new Schema({
        path: String,
        album: String,
        thumb: String,
        cover: Boolean
    });

ImageSchema.statics.create = function (options) {
    var self = this;
    return (new Promise(function (resolve, reject) {
        var img = new self();
        img.path = options.path;
        img.thumb = options.thumb;
        img.album = options.album;
        img.cover = options.cover;
        img.save(function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(img);
            }
        });
    })).then(function () {
        return Album.increaseCount(options.album);
    });
};
ImageSchema.statics.delete = function (id) {
    var self = this;

    return self.findById(id).exec().then(function (image) {
        return self.findByIdAndRemove(id).exec().then(function () {
            return Album.decreaseCount(image.album);
        });
    });
};

ImageSchema.statics.getAllImages = function () {
    return this.find({}).exec();
};
ImageSchema.statics.update = function (options) {
    return this.findByIdAndUpdate(options.id, {
        path: options.path,
        thumb: options.thumb,
        cover: options.cover
    }).exec();
};
ImageSchema.statics.findOneAlbumImage = function (name) {
    return this.find({album: name}).exec();
};

var Image = module.exports = mongoose.model('Image', ImageSchema);