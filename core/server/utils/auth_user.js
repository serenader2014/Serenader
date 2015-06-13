var url = global.config.url;

module.exports = function (req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        if (global.initialized) {
            res.redirect(url.admin + url.sign);
        } else {
            res.redirect(url.admin + url.sign + '#/setup');
        }
    }
};