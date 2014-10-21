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

ImageSchema.statics.addImage = function (options) {
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
ImageSchema.statics.deleteImage = function (id) {
    var self = this;

    return self.findById(id).exec().then(function (image) {
        return self.findByIdAndRemove(id).exec().then(function () {
            return Album.decreaseCount(image.album);
        });
    });
};
ImageSchema.statics.adjustAlbum = function (oldAlbum, newAlbum) {
    return this.find({album: oldAlbum}).exec().then(function (images) {
        return images.reduce(function (p, img) {
            return p.then(function () {
                return new Promise(function (resolve, reject) {
                    img.album = newAlbum;
                    img.save(function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });
        }, Promise.resolve());
    });
};

ImageSchema.statics.getAllImages = function () {
    return this.find({}).exec();
};
ImageSchema.statics.updateImage = function (options) {
    return this.findByIdAndUpdate(id, {
        path: options.path,
        thumb: options.thumb,
        cover: options.cover
    }).exec();
};
ImageSchema.statics.findOneAlbumImage = function (name) {
    return this.find({album: name}).exec();
};

var Image = module.exports = mongoose.model('Image', ImageSchema);