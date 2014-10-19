var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    Promise = require('bluebird'),
    
    AlbumSchema = new Schema({
        name: String,
        desc: String,
        cover: String,
        user: String ,
        count: { type: Number, default: 0},
        private: { type: Boolean, default: true }
    });


AlbumSchema.statics.addAlbum = function (options) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var album = new self();
        album.name = options.name;
        album.desc = options.desc;
        album.user = options.user;
        album.private = options.private;
        album.cover = options.cover;
        album.count = 0;
        album.save(function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(album);
            }
        });
    });
};

AlbumSchema.statics.updateAlbum = function (options) {
    var obj = {};
    _.extend(obj, options);

    return this.findByIdAndUpdate(options.id, obj).exec();
};

AlbumSchema.statics.deleteAlbum = function (id) {
    return this.findByIdAndRemove(id).exec();
};

AlbumSchema.statics.getAllAlbum = function () {
    return this.find({}).exec();
};

AlbumSchema.statics.getOneAlbum = function (name) {
    return this.findOne({name: name}).exec();
};

AlbumSchema.statics.getPublicAlbum = function () {
    return this.find({}).nor([{private: true}]).exec();
};

AlbumSchema.statics.getUserAllAlbum = function (user) {
    return this.find({user: user}).exec();
};

AlbumSchema.statics.getUserPublicAlbum = function (user) {
    return this.find({user: user}).nor([{private: true}]).exec();
};

AlbumSchema.statics.increaseCount = function (name) {
    var self = this;

    return self.findOne({name: name}).exec().then(function (album) {
        return new Promise(function (resolve, reject) {
            album.count = album.count + 1;
            album.save(function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(album);
                }
            });
        });
    });
};

AlbumSchema.statics.decreaseCount = function (name, callback) {
    var self = this;

    return self.findOne({name: name}).exec().then(function (album) {
        return new Promise(function (resolve, reject) {
            album.count = album.count - 1;
            album.save(function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(album);
                }
            });
        });
    });
};

var Album = module.exports = mongoose.model('Album', AlbumSchema);