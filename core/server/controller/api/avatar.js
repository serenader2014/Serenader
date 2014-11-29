var validator = require('validator'),
    User = require('../../models').User,
    config = require('../../../../config').config,
    url = config.url,
    root = config.root_dir,
    log = require('../../utils/log')();

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