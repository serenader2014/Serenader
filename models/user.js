var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    uid: { type: String , unique: true },
    email: { type: String , unique: true },
    pwd: { type: String },
    website: { type: String },
    profile_header: { type: String },
    avatar: { type: String },
    role: { type: String },
    signature: { type: String }
});

mongoose.model('User', User);