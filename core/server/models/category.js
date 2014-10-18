var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = require('bluebird'),

    CategorySchema = new Schema({
        name: { type: String },
        count: { type: Number }
    });

CategorySchema.statics.createNew = function (name, callback) {
    var c = new this();
    c.name = name;
    c.count = 0;
    c.save(callback);
    return c;
};
CategorySchema.statics.getAll = function () {
    return this.find({}).exec();
};
CategorySchema.statics.update = function (id, name) {
    return this.findByIdAndUpdate(id, {
        name: name
    }).exec();
};

CategorySchema.statics.getOneByName = function (name) {
    return this.findOne({name: name}).exec();
};
CategorySchema.statics.getOneById = function (id) {
    return this.findById(id).exec();
};
CategorySchema.statics.delete = function (id) {
    return this.findByIdAndRemove(id).exec();
};
CategorySchema.statics.decreaseCount = function (name) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.findOne({name:name}, function (err, c) {
            if (err) {
                console.error(err);
                reject(err);
            }
            if (c) {
                c.count = c.count - 1;
                c.save(function () {
                    resolve();
                });
            }
        });
    });
};
CategorySchema.statics.increaseCount = function (name) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.findOne({name:name}, function (err, c) {
            if (err) {
                console.error(err);
                reject(err);
            }
            if (c) {
                c.count = c.count + 1;
                c.save(function () {
                    resolve();
                });
            }
        });
    });
};


var Category = module.exports = mongoose.model('Category', CategorySchema);