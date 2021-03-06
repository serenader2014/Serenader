var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,
    _ = require('lodash'),

    AlbumSchema = new Schema({
        slug: { type: String, unique: true },
        name: String,
        desc: String,
        cover: String,
        user: String ,
        private: { type: Boolean, default: true }
    });


AlbumSchema.statics.create = function (options) {
    var album = new this();
    album.name = options.name;
    album.slug = options.slug;
    album.desc = options.desc;
    album.user = options.user;
    album.private = options.private;
    album.cover = options.cover;
    return album.saveAsync().spread(function (album) {
        return album;
    });
};

AlbumSchema.statics.update = function (options) {
    var obj = {};
    _.extend(obj, options);

    return this.findByIdAndUpdateAsync(options.id, obj);
};

AlbumSchema.statics.delete = function (id) {
    return this.findByIdAndRemoveAsync(id);
};

AlbumSchema.statics.getAllAlbums = function () {
    return this.findAsync({}, null, {sort: {_id: -1}});
};

AlbumSchema.statics.getAlbumByName = function (name) {
    return this.findOneAsync({name: name});
};

AlbumSchema.statics.getAlbumById = function (id) {
    return this.findByIdAsync(id);
};

AlbumSchema.statics.getAlbumBySlug = function (slug) {
    return this.findOneAsync({slug: slug});
};

AlbumSchema.statics.getPublicAlbums = function () {
    return this.findAsync({private: false});
};

AlbumSchema.statics.getUserAllAlbums = function (user) {
    return this.findAsync({user: user});
};

AlbumSchema.statics.getUserPublicAlbums = function (user) {
    return this.findAsync({user: user, private: false});
};

AlbumSchema.statics.getUserPrivateAlbums = function (user) {
    return this.findAsync({user: user, private: true});
};

var Album = module.exports = mongoose.model('Album', AlbumSchema);