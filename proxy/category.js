var Category = require('../models').Category;

module.exports.createNew = function (name, callback) {
    var c = new Category();
    c.name = name;
    c.count = 0;
    c.save(callback);
};

module.exports.getAll = function (callback) {
    Category.find({}, callback);
};

module.exports.update = function (id, name, callback) {
    Category.update({_id: id}, {_id: id, name: name}, callback);
};

module.exports.getOneByName = function (name, callback) {
    Category.findOne({name: name}, callback);
};

module.exports.getOneById = function (id, callback) {
    Category.findById(id, callback);
};

module.exports.delete = function (id, callback) {
    Category.findByIdAndRemove(id, callback);
};

module.exports.decreaseCount = function (name) {
    Category.findOne({name:name}, function (err, c) {
        if (err) {
            console.error(err);
        }
        if (c) {
            c.count = c.count - 1;
            c.save();
        }
    });
};

module.exports.increaseCount = function (name) {
    Category.findOne({name:name}, function (err, c) {
        if (err) {
            console.error(err);
        }
        if (c) {
            c.count = c.count + 1;
            c.save();
        }
    });
};