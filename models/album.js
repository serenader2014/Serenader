var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Album = new Schema({
    name: { type: String },
    desc: { type: String },
    cover: { type: String },
    user: { type: String },
    count: { type: Number },
    private: { type: Boolean }
});

mongoose.model('Album', Album);