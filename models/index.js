var mongoose = require('mongoose');

require('./setting');
require('./user');
require('./post');
require('./category');
require('./image');
require('./album');
require('./draft');

module.exports.Setting = mongoose.model('Setting');
module.exports.User = mongoose.model('User');
module.exports.Post = mongoose.model('Post');
module.exports.Draft = mongoose.model('Draft');
module.exports.Category = mongoose.model('Category');
module.exports.Image = mongoose.model('Image');
module.exports.Album = mongoose.model('Album');