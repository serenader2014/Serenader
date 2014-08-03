var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Post = new Schema({
    title: { type: String },
    author: { type: String },
    date: { type: Array },
    tags: { type: Array },
    post: { type: String },
    category: { type: String },
});

mongoose.model('Post', Post);