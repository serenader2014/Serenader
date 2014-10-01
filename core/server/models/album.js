var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    
    AlbumSchema = new Schema({
        name: { type: String },
        desc: { type: String },
        cover: { type: String },
        user: { type: String },
        count: { type: Number },
        private: { type: Boolean }
    });


AlbumSchema.statics.addAlbum = function (options, callback) {
    var album = new this();
    album.name = options.name;
    album.desc = options.desc;
    album.user = options.user;
    album.private = options.private;
    album.cover = options.cover;
    album.count = 0;
    album.save(callback);
};

AlbumSchema.statics.updateAlbum = function (options, callback) {
    var obj = {};
    _.extend(obj, options);

    this.findByIdAndUpdate(options.id, obj, callback);
};

AlbumSchema.statics.deleteAlbum = function (id, callback) {
    this.findByIdAndRemove(id, callback);
};

AlbumSchema.statics.getAllAlbum = function (callback) {
    this.find({}, callback);
};

AlbumSchema.statics.getOneAlbum = function (name, callback) {
    this.findOne({name: name}, callback);
};

AlbumSchema.statics.getPublicAlbum = function (callback) {
    this.find({}).nor([{private: true}]).exec(callback);
};

AlbumSchema.statics.getUserAllAlbum = function (user, callback) {
    this.find({user: user}, callback);
};

AlbumSchema.statics.getUserPublicAlbum = function (user, callback) {
    this.find({user: user}).nor([{private: true}]).exec(callback);
};

AlbumSchema.statics.increaseCount = function (name) {
    var self = this;
    self.findOne({name: name}, function (err, a) {
        if (err) {
            console.error(err);
            return false;
        }
        if (a) {
            self.findOneAndUpdate({name: a.name}, {
                count: a.count + 1
            }, function (err, a) {
                if (err) {
                    console.error(err);
                }
            });
        }
    });
};

AlbumSchema.statics.decreaseCount = function (name, callback) {
    var self = this;
    self.findOne({name: name}, function (err, a) {
        if (err) {
            console.error(err);
            return false;
        }
        if (a) {
            self.findOneAndUpdate({name: a.name}, {
                count: a.count - 1
            }, function (err, al) {
                console.log(al.count);
                if (err) {
                    console.error(err);
                    return false;
                }
                if (callback && typeof callback === 'function') {
                    callback();
                }
            });
        }
    });
};

var Album = module.exports = mongoose.model('Album', AlbumSchema);