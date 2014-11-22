var Promise = require('bluebird'),
    validator = require('validator'),
    xss = require('xss'),
    fs = Promise.promisifyAll(require('fs-extra')),

    log = require('../../utils/log')(),
    Album = require('../../models').Album,
    Image = require('../../models').Image,

    config = require('../../../../config').config,
    root = config.root_dir + '/content/data/',
    url = config.url,
    fileUpload = require('../api/upload').fileUpload,
    imageVersions = require('../api/upload').imageVersions;

function checkExist (options) {
    var type = options.type,
        value = options.value;

    return new Promise(function (resolve, reject) {
        function getAlbum () {
            if (type === 'id') {
                return Album.getAlbumById(value);
            } else if (type === 'name') {
                return Album.getAlbumByName(value);
            } else if (type === 'slug') {
                return Album.getAlbumBySlug(value);
            }
        }
        getAlbum().then(function (album) {
            if (album) {
                resolve(album);
            } else {
                reject();
            }
        }).then(null, function (err) {
            reject(err);
        });
    });
}

function checkOwner (options, user) {
    return new Promise(function (resolve, reject) {
        checkExist(options).then(function (album) {
            if (album.user === user.uid || user.role === 'admin') {
                resolve(album);
            } else {
                reject();
            }
        }).catch(function (err) {
            reject(err || {message: '找不到该相册。', stack: ''});
        });
    });
}

module.exports = function (router) {
    router.post(url.newGallery, function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        var name = validator.trim(req.body.name),
            desc = validator.trim(req.body.desc),
            userName = req.session.user.uid,
            private = validator.trim(req.body.private);

        private = private === 'true' ? true : (private === 'false' ? false : private);
        if (! name) {
            res.json({ret: -1,error: '相册名称为空。'});
            return false;
        }

        if (typeof private !== 'boolean') {
            res.json({ret: -1,error: 'private键值类型错误。'});
            return false;
        }

        checkExist({type: 'name', value: name}).then(function () {
            res.json({ret: -1, error: '该相册已存在！'});
            return false;
        }).catch(function (err) {
            if (err) {
                res.json({ret: -1, error: err.message});
                return false;
            } else {
                Album.create({
                    name: name,
                    desc: desc,
                    user: userName,
                    cover: '/img/default_album.png',
                    private: private
                }).then(function () {
                    res.json({ret: 0});
                }).then(null, function (err) {
                    res.json({
                        ret: -1,
                        error: err.message
                    });
                    return false;
                });
            }
        });
    });

    router.post(url.gallery + '/:type/:slug', function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1,error: '权限不足。'});
            return false;
        }
        var albumSlug =  validator.trim(decodeURIComponent(req.params.slug)),
            type = validator.trim(decodeURIComponent(req.params.type)),
            userName = req.session.user.uid,
            dir = root + type + '/' + userName + '/gallery/';

        if (type !== 'public' && type !== 'private') {
            res.json({ error: 'private键值类型错误。', ret: -1 });
            return false;
        }

        checkOwner({type: 'slug', value: albumSlug}, req.session.user).then(function (album) {
            fileUpload(req, res, {
                uploadDir: dir + album.id,
                path: '/static/' + userName + '/gallery/' + album.id,
                typeReg: /\.(gif|jpe?g|png)$/i
            }, function (err, files) {
                if (err) {
                    res.json({ ret: -1, error: err });
                    return false;
                }
                files.reduce(function (p, file) {
                    return p.then(function () {
                        return Image.create({
                            path: file.url,
                            album: album.id,
                            thumb: file.thumbnailUrl
                        });
                    });
                }, Promise.resolve()).then(function () {
                    res.json(files);
                }).then(null, function (err) {
                    log.error(err.stack);
                    res.json({ ret: -1, error: err.message });
                });
            });
        }).catch(function (err) {
            res.json({ret: -1, error: err && err.message ? err.message : '权限不足。'});
        });
    });

    router.put(url.gallery + '/:id', function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        var id = validator.trim(decodeURIComponent(req.params.id)),
            name = validator.trim(xss(req.body.name)),
            description = validator.trim(req.body.desc),
            cover = validator.trim(req.body.cover),
            slug = validator.trim(req.body.slug),
            private = req.body.private ;

        private = private === 'true' ? true : (private === 'false' ? false : private);

        if (!name) {
            res.json({ ret: -1, error: '相册名称为空。' });
            return false;
        }

        if (typeof private !== 'boolean') {
            res.json({ ret: -1, error: 'private键值类型错误。' });
            return false;
        }

        checkOwner({type: 'id', value: id}, req.session.user).then(function () {
            return Album.update({
                name: name,
                desc: description,
                cover: cover,
                slug: slug,
                private: private,
            }).then(function () {
                res.json({ret: 0});
            });
        }).catch(function (err) {
            res.json({ret: -1, error: err && err.message ? err.message : '权限不足。'});
        });
    });

    router.delete(url.gallery + '/:type/:slug', function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        var albumSlug = validator.trim(decodeURIComponent(req.params.slug)),
            type = validator.trim(req.params.type),
            ids = req.body.ids,
            userName = req.session.user.uid,
            basePath = root + type + '/' + userName + '/gallery/';

        if (type !== 'public' && type !== 'private') {
            res.json({ret: -1,error: 'private键值类型错误。'});
            return false;
        }

        if (! Array.isArray(ids)) {
            res.json({ret: -1,error: 'ids键值类型错误。'});
            return false;
        }

        checkOwner({type: 'slug', value: albumSlug}, req.session.user).then(function (album) {
            return ids.reduce(function (p, item) {
                var id = validator.trim(item.id);
                return p.then(function () {
                    return Image.delete(id);
                }).then(function () {
                    return fs.unlinkAsync(basePath + album.id + '/' + decodeURIComponent(item.path));
                }).then(function () {
                    return Object.keys(imageVersions).reduce(function (pms, version) {
                        return pms.then(function () {
                            return fs.unlinkAsync(basePath + album.id + '/' + version + '/' + decodeURIComponent(item.path));
                        });
                    }, Promise.resolve());
                });
            }, Promise.resolve());
        }).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            res.json({ret: -1, error: err && err.message ? err.message : '权限不足。'});
        });
    });


    router.delete(url.gallery + '/:id', function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        var id = validator.trim(req.params.id),
            userName = req.session.user.uid,
            albumName,
            type;

        checkOwner({type: 'id', value: id}, req.session.user).then(function (album) {
            albumName = album.name;
            type = album.private ? 'private' : 'public';
            return Image.findOneAlbumImage(albumName);
        }).then(function (images) {
            return images.reduce(function (p, img) {
                return p.then(function () {
                    return Image.delete(img.id);
                });
            }, Promise.resolve());
        }).then(function () {
            return Album.deleteAlbum(id);
        }).then(function () {
            return fs.removeAsync(root + type + '/' + userName + '/gallery/' + albumName);
        }).then(function () {
            res.json({ret: 0,});
        }).then(null, function (err) {
            res.json({
                ret: -1,
                error: err && err.message ? err.message : '权限不足。'
            });
        });
    });
};

module.exports.utils = {
    checkExist: checkExist,
    checkOwner: checkOwner
};