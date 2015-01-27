var Promise = require('bluebird'),
    validator = require('validator'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs-extra')),
    log = require('../../utils/log')(),
    Album = require('../../models').Album,
    Image = require('../../models').Image,

    config = require('../../../../config').config,
    root = config.root_dir + '/content/data/',
    url = config.url,
    fileUpload = require('../../utils/upload');

function getAlbum (options) {
    var type = options.type,
        value = options.value;
    if (type === 'id') {
        return Album.getAlbumById(value);
    } else if (type === 'name') {
        return Album.getAlbumByName(value);
    } else if (type === 'slug') {
        return Album.getAlbumBySlug(value);
    }
}

function getPublicAlbums (user) {
    return Album.getPublicAlbums().then(function (albums) {
        if (user) {
            return Album.getUserPrivateAlbums(user.uid).then(function (a) {
                return albums.concat(a);
            });
        } else {
            return albums;
        }
    });
}

function checkExist (options) {
    var type = options.type,
        value = options.value;

    return new Promise(function (resolve, reject) {
        getAlbum({type: type, value: value}).then(function (album) {
            if (album) {
                resolve(album);
            } else {
                reject();
            }
        }).catch(function (err) {
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
                reject('权限不足。');
            }
        }).catch(function (err) {
            reject(err || '找不到该相册。');
        });
    });
}

function getUserAlbums (currentUser, targetUser) {
    if (currentUser && currentUser.uid === targetUser) {
        return Album.getUserAllAlbums(targetUser);
    } else {
        return Album.getUserPublicAlbums(targetUser);
    }
}

module.exports = function (router) {
    router.get(url.gallery, function (req, res) {
        var user = req.session.user;

        getPublicAlbums(user).then(function (albums) {
            res.json({ret: 0, data: albums});
        }).catch(function (err) {
            log.error(err.stack);
            res.json({ret: -1, error: err.message || err});
        });
    });

    router.get(url.gallery + '/:id', function (req, res) {
        var user = req.session.user,
            id = validator.trim(req.params.id);

        checkOwner({type: 'id', value: id}, user).then(function (album) {
            return Image.findOneAlbumImage(id).then(function (images) {
                res.json({
                    ret: 0,
                    data: {
                        _id: album._id,
                        images: images,
                        name: album.name,
                        slug: album.slug,
                        desc: album.desc,
                        user: album.user,
                        cover: album.cover,
                        private: album.private
                    }
                });
            });
        }).catch(function (err) {
            res.json({ret: -1, error: err.message || err});
        });
    });

    router.get(url.user + '/:uid' + url.gallery, function (req, res) {
        var user = req.session.user,
            uid = validator.trim(req.params.uid);

        getUserAlbums(user, uid).then(function (albums) {
            res.json({ret: 0, data: albums});
        }).catch(function (err) {
            res.json({ret: -1, error: err});
        });
    });

    router.post(url.gallery, function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        var name = validator.trim(req.body.name),
            desc = validator.trim(req.body.desc),
            slug = validator.trim(req.body.slug),
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
                    slug: slug,
                    user: userName,
                    cover: '/default_album.png',
                    private: private
                }).then(function (album) {
                    res.json({ret: 0, data: {album: album}});
                }).catch(function (err) {
                    res.json({ret: -1, error: err.message || err});
                    return false;
                });
            }
        });
    });

    router.post(url.gallery + '/:slug', function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1,error: '权限不足。'});
            return false;
        }
        var albumSlug =  validator.trim(decodeURIComponent(req.params.slug)),
            userName = req.session.user.uid;

        checkOwner({type: 'slug', value: albumSlug}, req.session.user).then(function (album) {
            var type = album.private ? 'private' : 'public',
                dir = root + type + '/' + userName + '/gallery/';
            fileUpload(req, res, {
                uploadDir: dir + album.id,
                baseUrl: '/static/' + userName + '/gallery/' + album.id + '/',
                deleteUrl: url.api + url.gallery + '/' + type + '/' + albumSlug,
                acceptFileTypes: /\.(gif|jpe?g|png)$/i
            }).then(function (files) {
                var imgs = [];
                return files.reduce(function (p, file) {
                    return p.then(function () {
                        return Image.create({
                            path: file.url,
                            album: album.id,
                            name: path.basename(file.url),
                            thumb: file.imageVersions.thumbnail
                        }).then(function (img) {
                            imgs.push(img);
                        });
                    });
                }, Promise.resolve()).then(function () {
                    res.json({ret: 0, data: imgs});
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
            name = validator.trim(req.body.name),
            description = validator.trim(req.body.desc),
            cover = validator.trim(req.body.cover),
            slug = validator.trim(req.body.slug),
            private = req.body.private ;

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
                id: id,
                name: name,
                desc: description,
                cover: cover,
                slug: slug,
                private: private,
            });
        }).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            console.log(3);
            res.json({ret: -1, error: err && err.message ? err.message : '权限不足。'});
        });
    });

    router.delete(url.gallery + '/:slug/:id', function (req, res) {
        if (!req.session.user) {
            res.json({ret: -1, error: '权限不足。'});
            return false;
        }
        var albumSlug = validator.trim(decodeURIComponent(req.params.slug)),
            type,
            id = validator.trim(decodeURIComponent(req.params.id)),
            userName = req.session.user.uid,
            basePath,
            imgName;

        checkOwner({type: 'slug', value: albumSlug}, req.session.user).then(function (album) {
            type = album.private ? 'private' : 'public';
            basePath = root + type + '/' + userName + '/gallery/';
            return Image.delete(id).then(function (deletedImg) {
                imgName = decodeURIComponent(path.basename(deletedImg.path));
                return fs.unlinkAsync(basePath + album.id + '/' + imgName);
            }).then(function () {
                return fs.unlinkAsync(basePath + album.id + '/thumbnail/' + imgName);
            });
        }).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            log.error(err);
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
            return Album.delete(id);
        }).then(function () {
            return fs.removeAsync(root + type + '/' + userName + '/gallery/' + id);
        }).then(function () {
            res.json({ret: 0,});
        }).catch(function (err) {
            res.json({
                ret: -1,
                error: err && err.message ? err.message : '权限不足。'
            });
        });
    });
};

module.exports.utils = {
    checkExist: checkExist,
    checkOwner: checkOwner,
    getAlbum: getAlbum,
    getPublicAlbums: getPublicAlbums
};