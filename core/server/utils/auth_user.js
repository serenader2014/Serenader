var url = require('../../../config').config.url;

module.exports = function (req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect(url.admin + url.sign + '?url=' + req.originalUrl);
    }
};