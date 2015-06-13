var validator = require('validator');
var User      = require('../../models').User;
var config    = global.config;
var url       = config.url;
var root      = config.root_dir;
var log       = require('../../utils/log')();

module.exports = function (router) {
    router.get(url.avatar + '/:username', function (req, res, next) {
        var userName = validator.trim(req.params.username);
        User.getOneUserById(userName).then(function (user) {
            if (user) {
                res.sendfile(root + user.avatar);
            } else {
                next();
            }
        }).catch(function (err) {
            log.error(err.stack);
            next();
        });
    });
};