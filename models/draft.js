var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Draft = new Schema({
    title: { type: String },
    author: { type: String },
    date: { type: Array },
    tags: { type: Array },
    post: { type: String },
    category: { type: String },
    originalId: { type: String }
});

mongoose.model('Draft', Draft);