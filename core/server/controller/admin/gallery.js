var validator = require('validator'),
    auth_user = require('../../utils/auth_user'),
    Album = require('../../models').Album,
    Image = require('../../models').Image,
    utils = require('../api/gallery').utils,
    config = require('../../../../config').config,
    url = config.url,
    errorHandling = require('../../utils/error');


module.exports = function (router) {
    router.get(url.gallery, auth_user, function (req, res) {
        var userName = req.session.user.uid;
        Album.getUserAllAlbum(userName).then(function (a) {
            if (a) {
                res.render('gallery', {albums: a});
            } else {
                errorHandling(req, res, { error: '找不到该相册。', type: 404});
                return false;
            }
        }).then(null, function (err) {
            errorHandling(req, res, { error: err.message, type: 500});
        });
    });

    router.get(url.gallery + '/:slug', auth_user, function (req, res) {
        var albumSlug = validator.trim(decodeURIComponent(req.params.album));

        utils.checkOwer({type: 'slug', value: albumSlug}, req.session.user).then(function (album) {
            return Image.findOneAlbumImage(album.name).then(function (images) {
                res.render('album', {
                    images: images,
                    album: album
                });
            });
        }).catch(function (err) {
            errorHandling(req, res, { error: err && err.message ? err.message : '权限不足。', type: 500});
        });
    });
};