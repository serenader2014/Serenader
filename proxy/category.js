var Category = require('../models').Category;

module.exports.createNewCategory = function (name, callback) {
    var c = new Category();
    c.name = name;
    c.count = 0;
    c.save(callback);
};

module.exports.getAllCategories = function (callback) {
    Category.find({}, callback);
};

module.exports.updateCategory = function (id, name, callback) {
    Category.update({_id: id}, {_id: id, name: name}, callback);
};

module.exports.getOneCategory = function (name, callback) {
    Category.findOne({name: name}, callback);
};

module.exports.decreaseCount = function (name) {
    Category.find({name:name}, function (err, c) {
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
    Category.find({name:name}, function (err, c) {
        if (err) {
            console.error(err);
        }
        if (c) {
            c.count = c.count + 1;
            c.save();
        }
    });
};