var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: { type: String },
    count: { type: Number }
});

CategorySchema.statics.createNew = function (name, callback) {
    var c = new this();
    c.name = name;
    c.count = 0;
    c.save(callback);
};
CategorySchema.statics.getAll = function (callback) {
    this.find({}, callback);
};
CategorySchema.statics.update = function (id, name, callback) {
    this.findByIdAndUpdate(id, {
        name: name
    }, callback);
};

CategorySchema.statics.getOneByName = function (name, callback) {
    this.findOne({name: name}, callback);
};
CategorySchema.statics.getOneById = function (id, callback) {
    this.findById(id, callback);
};
CategorySchema.statics.delete = function (id, callback) {
    this.findByIdAndRemove(id, callback);
};
CategorySchema.statics.decreaseCount = function (name) {
    this.findOne({name:name}, function (err, c) {
        if (err) {
            console.error(err);
        }
        if (c) {
            c.count = c.count - 1;
            c.save();
        }
    });
};
CategorySchema.statics.increaseCount = function (name) {
    this.findOne({name:name}, function (err, c) {
        if (err) {
            console.error(err);
        }
        if (c) {
            c.count = c.count + 1;
            c.save();
        }
    });
};


var Category = module.exports = mongoose.model('Category', CategorySchema);