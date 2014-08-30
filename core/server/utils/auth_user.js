var url = require('../../../config').config.url;

module.exports = function (req, res, next) {
    if (req.session.user) {
        res.locals.current_user = req.session.user;
        next();
    } else {
        res.redirect(url.admin + url.adminSignIn);
    }
};