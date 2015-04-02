var unidecode = require('unidecode'),
    validator = require('validator'),
    url = require('../../../../config').config.url;

module.exports = function (router) {
    router.post(url.slug, function (req, res) {
        if (req.body.slug) {
            var s = validator.trim(unidecode(req.body.slug)).replace(/(\s)|\W/g, '-').replace(/-+/g, '-').toLowerCase();
            if (s.substring(s.length - 1) === '-') {
                s = s.substring(0, s.length - 1);
            }
            res.json({
                ret: 0,
                data: s
            });
        } else {
            res.json({
                ret: -1,
                error: 'slug字段为空.'
            });
        }
    });
};