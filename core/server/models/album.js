var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    Promise = require('bluebird'),
    
    AlbumSchema = new Schema({
        slug: { type: String, unique: true },
        name: String,
        desc: String,
        cover: String,
        user: String ,
        count: { type: Number, default: 0},
        private: { type: Boolean, default: true }
    });


AlbumSchema.statics.create = function (options) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var album = new self();
        album.name = options.name;
        album.slug = options.slug;
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

AlbumSchema.statics.update = function (options) {
    var obj = {};
    _.extend(obj, options);

    return this.findByIdAndUpdate(options.id, obj).exec();
};

AlbumSchema.statics.delete = function (id) {
    return this.findByIdAndRemove(id).exec();
};

AlbumSchema.statics.getAllAlbums = function () {
    return this.find({}, null, {sort: {_id: -1}}).exec();
};

AlbumSchema.statics.getAlbumByName = function (name) {
    return this.findOne({name: name}).exec();
};

AlbumSchema.statics.getAlbumById = function (id) {
    return this.findById(id).exec();
};

AlbumSchema.statics.getAlbumBySlug = function (slug) {
    return this.findOne({slug: slug}).exec();
};

AlbumSchema.statics.getPublicAlbums = function () {
    return this.find({}).nor([{private: true}]).exec();
};

AlbumSchema.statics.getUserAllAlbums = function (user) {
    return this.find({user: user}).exec();
};

AlbumSchema.statics.getUserPublicAlbums = function (user) {
    return this.find({user: user}).nor([{private: true}]).exec();
};

AlbumSchema.statics.increaseCount = function (name) {
    var self = this;

    return self.findOne({name: name}).exec().then(function (album) {
        return new Promise(function (resolve, reject) {
            album.count = album.count + 1;
            album.save(function (err, a) {
                if (err) {
                    reject(err);
                } else {
                    resolve(album);
                }
            });
        });
    });
};

AlbumSchema.statics.decreaseCount = function (name) {
    var self = this;

    return self.findOne({name: name}).exec().then(function (album) {
        return new Promise(function (resolve, reject) {
            album.count = album.count - 1;
            album.save(function (err, a) {
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