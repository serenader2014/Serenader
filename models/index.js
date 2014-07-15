var mongoose = require('mongoose');

require('./setting');
require('./user');
require('./post');
require('./category');

module.exports.Setting = mongoose.model('Setting');
module.exports.User = mongoose.model('User');
module.exports.Post = mongoose.model('Post');
module.exports.Category = mongoose.model('Category');