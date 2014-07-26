var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Album = require('../../proxy').album;
var Image = require('../../proxy').image;

var upload = require('jquery-file-upload-middleware');
var root = require('../../config').config.root_dir + '/data/';

module.exports = function (router) {
    router.get('/gallery', auth_user, function (req, res, next) {
        var userName = req.session.user.uid;
        Album.getUserAllAlbum(userName, function (err, a) {
            if (err) res.send(err);
            if (a) {
                res.render('admin_gallery', {adminPath: adminPath, locals: res.locals, albums: a});
            } else {
                res.send('');
            }
        });
    });

    router.post('/gallery/new', auth_user, function (req, res, next) {
        var name = req.body.name;
        var desc = req.body.desc;
        var cover = req.body.cover;
        var userName = req.session.user.uid;
        var private = req.body.private ? true : false;
        Album.addAlbum({
            name: name,
            desc: desc,
            cover: cover,
            user: userName,
            private: private
        }, function (err) {
            if (err) res.send(err);
            res.redirect(adminPath+'/gallery');
        });
    });

    router.get('/gallery/:album', auth_user, function (req, res, next) {
        var album = req.params.album;
        var userName = req.session.user.uid;
        Album.getOneAlbum(album, function (err, a) {
            if (err) {
                res.send(err);
                return false;
            } 
            if (a) {
                if (a.user === userName || userName === 'admin') {
                    Image.findOneAlbumImage(a.name, function (err, images) {
                        if (err) {
                            res.send(err);
                            return false;
                        }
                        if (images) {
                            res.render('admin_one_album', {
                                adminPath: adminPath,
                                locals: res.locals,
                                images: images,
                                album: a
                            });
                        }
                    });
                } else {
                    res.redirect(adminPath+'/gallery');
                }
            }
        });
    });

    router.post('/gallery/upload/:album', auth_user, function (req, res, next) {
        var album = req.params.album;
        var userName = req.session.user.uid;
        var desc = req.body.desc;

        Album.getOneAlbum(album, function (err, a) {
            if (err) {
                res.send(err);
                return false;
            }
            if (a) {
                if (a.user === userName) {
                    var type = a.private ? 'private' : 'public';
                    upload.fileHandler({
                        uploadDir: function () {
                            return root + type + '/' + userName + '/gallery/' + album;
                        },
                        uploadUrl: req.url
                    })(req, res, next);
                    
                    upload.on('end', function (fileInfo) {
                        Image.addImage({
                            path: '/static/'+userName+'/gallery/'+ album + '/' + fileInfo.name,
                            desc: desc,
                            album: album
                        }, function (err) {
                            if (err) {
                                res.send(err);
                                return false;
                            }
                            // res.redirect(adminPath+'/gallery/'+album);
                        });
                    });
                }

            }
        });
    });

};