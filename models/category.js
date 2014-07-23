var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Category = new Schema({
    name: { type: String },
    count: { type: Number }
});

mongoose.model('Category', Category);