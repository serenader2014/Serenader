var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Album = new Schema({
    name: { type: String },
    desc: { type: String },
    private: { type: Boolean }
});

mongoose.model('Album', Album);