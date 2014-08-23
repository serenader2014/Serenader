var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Post = new Schema({
    title: { type: String },
    author: { type: String },
    authorAvatar: { type: String },
    date: { type: Array },
    tags: { type: Array },
    content: { type: String },
    excerpt: { type: String },
    published: { type: Boolean },
    category: { type: String },
    views: { type: Number, default: 0 }
});

mongoose.model('Post', Post);