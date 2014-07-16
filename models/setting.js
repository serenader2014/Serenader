var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Setting = new Schema({
    name: { type: String },
    desc: { type: String },
    logo: { type: String },
    favicon: { type: String },
    nav: { type: Array },
    admin_path: { type: String },
    allow_sign_up: { type: Boolean },
    id: { type: String }
});

mongoose.model('Setting', Setting);