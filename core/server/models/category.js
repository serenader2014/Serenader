var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose')),
    Schema = mongoose.Schema,

    CategorySchema = new Schema({
        name: { type: String, unique: true},
        count: { type: Number, default: 0 }
    });

CategorySchema.statics.create = function (name) {
    var c = new this();
    c.name = name;
    c.count = 0;
    return c.saveAsync();
};
CategorySchema.statics.update = function (id, name) {
    return this.findByIdAndUpdateAsync(id, {name: name});
};

CategorySchema.statics.getOneByName = function (name) {
    return this.findOneAsync({name: name});
};
CategorySchema.statics.getAll = function () {
    return this.findAsync({});
};
CategorySchema.statics.getOneById = function (id) {
    return this.findByIdAsync(id);
};
CategorySchema.statics.delete = function (id) {
    return this.findByIdAndRemoveAsync(id);
};
CategorySchema.statics.decreaseCount = function (name) {
    return this.findOneAsync({name: name}).then(function (category) {
        if (category) {
            category.count = category.count - 1;
            return category.saveAsync();
        } else {
            console.log('找不到该分类：' + name);
            return;
        }
    });
};
CategorySchema.statics.increaseCount = function (name) {
    return this.findOneAsync({name: name}).then(function (category) {
        if (category) {
            category.count = category.count + 1;
            return category.saveAsync();
        } else {
            console.log('找不到该分类：' + name);
            return;            
        }
    });
};


var Category = module.exports = mongoose.model('Category', CategorySchema);