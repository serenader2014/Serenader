var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    Album = require('./album'),

    ImageSchema = new Schema({
        path: { type: String },
        album: { type: String }
    });

ImageSchema.statics.addImage = function (options, callback) {
    var img = new this();
    img.path = options.path;
    img.album = options.album;
    Album.increaseCount(options.album);
    img.save(callback);
};
ImageSchema.statics.deleteImage = function (id, callback) {
    var self = this;
    self.findOneById(id, function (err, i) {
        if (err) {
            console.error(err);
        }
        if (i) {
            Album.decreaseCount(i.album);
            self.findByIdAndRemove(id, callback);
        }
    }); 
};
ImageSchema.statics.getAllImages = function (callback) {
    this.find({}, callback);
};
ImageSchema.statics.updateImage = function (options, callback) {
    this.findByIdAndUpdate(id, {
        path: options.path,
    }, callback);
};
ImageSchema.statics.findOneAlbumImage = function (name, callback) {
    this.find({album: name}, callback);
};

var Image = module.exports = mongoose.model('Image', ImageSchema);