var Category = require('../models').Category;

module.exports.createNewCategory = function (name, callback) {
    var c = new Category();
    c.name = name;
    c.save(callback);
};

module.exports.getAllCategories = function (callback) {
    Category.find({}, callback);
};

module.exports.updateCategory = function (id, name, callback) {
    Category.update({_id: id}, {_id: id, name: name}, callback);
};