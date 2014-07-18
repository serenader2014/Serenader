var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Image = new Schema({
    path: { type: String },
    desc: { type: String },
    album: { type: String }
});

mongoose.model('Image', Image);