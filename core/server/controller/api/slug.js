var unidecode = require('unidecode'),
    validator = require('validator'),
    url = require('../../../../config').config.url;

module.exports = function (router) {
    router.post(url.slug, function (req, res) {
        if (req.body.slug) {
            res.json({
                slug: validator.trim(unidecode(req.body.slug)).replace(/\s/g, '-').toLowerCase()
            });
        } else {
            res.json({
                slug: 'err'
            });
        }
    });
};