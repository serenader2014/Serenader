var validator = require('validator'),
    xss = require('xss'),

    auth_user = require('../../utils/auth_user'),
    Album = require('../../models').Album,
    Image = require('../../models').Image,

    config = require('../../../../config').config,
    root = config.root_dir + '/content/data/',
    url = config.url,
    fileUpload = require('./upload').fileUpload,

    errorHandling = require('../../utils/error'),

    userName,album;

module.exports = function (router) {
    router.get(url.adminGallery, auth_user, function (req, res, next) {
        var userName = req.session.user.uid;
        Album.getUserAllAlbum(userName, function (err, a) {
            if (err) {
                errorHandling(req, res, { error: err, type: 500});
                return false;
            }
            if (a) {
                res.render('admin_gallery', {albums: a});
            } else {
                errorHandling(req, res, { error: '找不到该相册。', type: 404});
                return false;
            }
        });
    });

    router.post(url.adminNewGallery, auth_user, function (req, res, next) {
        var name = validator.trim(xss(req.body.name)),
            desc = validator.trim(xss(req.body.desc)),
            userName = req.session.user.uid,
            private = req.body.private ? true : false;

        Album.addAlbum({
            name: name,
            desc: desc,
            user: userName,
            cover: '/img/default_album.png',
            private: private
        }, function (err) {
            if (err) {
                res.json({
                    status: 0,
                    error: err
                });
                return false;
            }
            res.json({
                status: 1,
                error: ''
            });
        });
    });

    router.get(url.adminGallery + '/:album', auth_user, function (req, res, next) {
        var album = validator.trim(xss(decodeURIComponent(req.params.album))),
            userName = req.session.user.uid;
        Album.getOneAlbum(album, function (err, a) {
            if (err) {
                errorHandling(req, res, { error: err, type: 500});
                return false;
            } 
            if (a) {
                if (a.user === userName || userName === 'admin') {
                    Image.findOneAlbumImage(a.name, function (err, images) {
                        if (err) {
                            errorHandling(req, res, { error: err, type: 500});
                            return false;
                        }
                        res.render('admin_one_album', {
                            images: images,
                            album: a
                        });
                    });
                } else {
                    res.redirect(adminPath+url.adminGallery);
                }
            }
        });
    });

    router.post(url.adminGalleryUpload + '/:album', auth_user, function (req, res, next) {
        var album =  validator.trim(xss(decodeURIComponent(req.params.album))),
            userName = req.session.user.uid;

        
    });

};