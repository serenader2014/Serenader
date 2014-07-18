var Album = require('../../proxy').album;

module.exports = function (router) {
    router.get('/gallery', function (req, res, next) {
        res.render('gallery');
    });

    router.get('/gallery/:album', function (req, res, next) {

    });
};