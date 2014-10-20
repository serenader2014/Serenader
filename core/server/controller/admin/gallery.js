var Promise = require('bluebird'),
    validator = require('validator'),
    xss = require('xss'),
    fs = Promise.promisifyAll(require('fs')),

    auth_user = require('../../utils/auth_user'),
    log = require('../../utils/log')(),
    Album = require('../../models').Album,
    Image = require('../../models').Image,

    config = require('../../../../config').config,
    root = config.root_dir + '/content/data/',
    url = config.url,
    fileUpload = require('./upload').fileUpload,
    imageVersions = require('./upload').imageVersions,

    errorHandling = require('../../utils/error'),

    userName,album;

module.exports = function (router) {
    router.get(url.adminGallery, auth_user, function (req, res, next) {
        var userName = req.session.user.uid;
        Album.getUserAllAlbum(userName).then(function (a) {
            if (a) {
                res.render('admin_gallery', {albums: a});
            } else {
                errorHandling(req, res, { error: '找不到该相册。', type: 404});
                return false;
            }
        }).then(null, function (err) {
            errorHandling(req, res, { error: err.message, type: 500});
        });
    });

    router.post(url.adminNewGallery, auth_user, function (req, res, next) {
        var name = validator.trim(xss(req.body.name)),
            desc = validator.trim(xss(req.body.desc)),
            userName = req.session.user.uid,
            private = validator.trim(xss(req.body.private));

        Album.addAlbum({
            name: name,
            desc: desc,
            user: userName,
            cover: '/img/default_album.png',
            private: private
        }).then(function () {
            res.json({
                status: 1,
                error: ''
            });
        }).then(null, function (err) {
            res.json({
                status: 0,
                error: err.code === 11000 ? 'This album name is already exist' : err.message
            });
            return false;
        });
    });

    router.get(url.adminGallery + '/:album', auth_user, function (req, res, next) {
        var album = validator.trim(xss(decodeURIComponent(req.params.album))),
            userName = req.session.user.uid;
        Album.getOneAlbum(album).then(function (a) {
            if (a) {
                if (a.user === userName || userName === 'admin') {
                    Image.findOneAlbumImage(a.name).then(function (images) {
                        res.render('admin_one_album', {
                            images: images,
                            album: a
                        });
                    });
                } else {
                    res.redirect(adminPath+url.adminGallery);
                }
            } else {
                errorHandling(req, res, { error: '找不到该相册。', type: 404 });
                return false;
            }
        }).then(null, function (err) {
            errorHandling(req, res, { error: err.message, type: 500});
        });
    });

    router.post(url.adminGalleryUpload + '/:type/:album', auth_user, function (req, res, next) {
        var album =  validator.trim(xss(decodeURIComponent(req.params.album))),
            type = validator.trim(xss(decodeURIComponent(req.params.type))),
            userName = req.session.user.uid,
            dir = root + type + '/' + userName + '/gallery/' + album;

        if (type !== 'public' && type !== 'private') {
            res.json({
                error: 'type error'
            });
            return false;
        }

        fileUpload(req, res, {
            uploadDir: dir,
            path: '/static/' + userName + '/gallery/' + album,
            typeReg: /\.(gif|jpe?g|png)$/i
        }, function (err, files, field) {
            if (err) {
                res.json({
                    status: 0,
                    error: err
                });
                return false;
            }
            files.reduce(function (p, file) {
                return p.then(function () {
                    return Image.addImage({
                        path: file.url,
                        album: album,
                        thumb: file.thumbnailUrl
                    });
                });
            }, Promise.resolve()).then(function () {
                res.json(files);
            }).then(null, function (err) {
                log.error(err.stack);
                res.json({
                    status: 0,
                    error: err.message
                });
            });
        });
    });

    router.delete(url.adminGalleryDelete + '/:type/:album', auth_user, function (req, res, next) {
        var album = validator.trim(xss(decodeURIComponent(req.params.album))),
            type = validator.trim(xss(req.params.type)),
            ids = req.body.ids,
            userName = req.session.user.uid,
            basePath = root + type + '/' + userName + '/gallery/' + album;

        if (type !== 'public' && type !== 'private') {
            res.json({
                error: 'tpye error'
            });
            return false;
        }

        if (! Array.isArray(ids)) {
            res.json({
                error: 'ids is not a arrary'
            });
            return false;
        }

        ids.reduce(function (p, item) {
            var id = validator.trim(xss(item.id));
            return p.then(function () {
                return Image.deleteImage(id);
            }).then(function () {
                return fs.unlinkAsync(basePath + '/' + decodeURIComponent(item.path));
            }).then(function () {
                return Object.keys(imageVersions).reduce(function (pms, version) {
                    return pms.then(function () {
                        return fs.unlinkAsync(basePath + '/' + version + '/' + decodeURIComponent(item.path));
                    });
                }, Promise.resolve());
            });
        }, Promise.resolve()).then(function () {
            res.json({
                status: 1,
                error: ''
            });
        }).then(null, function (err) {
            log.error(err.stack);
            res.json({
                status: 0,
                error: err.message
            });
        });
    });
};