var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Category = new Schema({
    name: { type: String }
});

mongoose.model('Category', Category);