var validator = require('validator'),
    xss = require('xss'),
    fs = require('fs'),

    auth_user = require('../../utils/auth_user'),
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
            private = validator.trim(xss(req.body.private));

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
            } else {
                errorHandling(req, res, { error: '找不到该相册。', type: 404 });
                return false;
            }
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
            path: '/static/' + userName + '/gallery/' + album
        }, function (files, field) {
            files.forEach(function (file, index) {
                Image.addImage({
                    path: file.url,
                    album: album,
                    thumb: file.thumbnailUrl
                }, function (err) {
                    if (err) {
                        console.log(err);
                        res.json([]);
                        return false;
                    }

                    if (index === files.length - 1) {
                        res.json(files);
                    }
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

        if (Object.prototype.toString.call(ids) !== '[object Array]') {
            res.json({
                error: 'ids is not a arrary'
            });
            return false;
        }


        ids.forEach(function (item, index) {
            var id = validator.trim(xss(item.id));
            Image.deleteImage(id, function (err, i) {
                if (err) {
                    res.json({
                        status: 0,
                        err: err
                    });
                    return false;
                }

                fs.unlink(basePath + '/' + item.path, function (err) {
                    if (err) {
                        res.json({
                            status: 0,
                            err: err
                        });
                        return false;
                    }
                    Object.keys(imageVersions).forEach(function (version, idx) {
                        fs.unlink(basePath + '/' + version + '/' + item.path, function (err) {
                            if (err) {
                                res.json({
                                    status: 0,
                                    err: err
                                });
                                return false;
                            }
                            if (idx === Object.keys(imageVersions).length - 1) {
                                if (index === ids.length - 1) {
                                    res.json({
                                        status: 1,
                                        err: ''
                                    });
                                    return false;
                                }
                            }
                        });
                    });
                });
            });
        });
    });
};