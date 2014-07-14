var mongoose = require('mongoose');

require('./setting');
require('./user');

module.exports.Setting = mongoose.model('Setting');
module.exports.User = mongoose.model('User');