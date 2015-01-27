var unidecode = require('unidecode'),
    validator = require('validator'),
    url = require('../../../../config').config.url;

module.exports = function (router) {
    router.post(url.slug, function (req, res) {
        if (req.body.slug) {
            res.json({
                ret: 0,
                data: validator.trim(unidecode(req.body.slug)).replace(/\s/g, '-').toLowerCase()
            });
        } else {
            res.json({
                ret: -1,
                error: 'slug字段为空.'
            });
        }
    });
};