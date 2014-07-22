var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Album = require('../../proxy').album;
var Image = require('../../proxy').image;

var upload = require('jquery-file-upload-middleware');
var root = require('../../config').config.root_dir;

module.exports = function (router) {
    router.get('/gallery', auth_user, function (req, res, next) {
        var albums = [];
        Album.getAllAlbum(function (err, a) {
            if (err) res.send(err);
            if (a) {
                a.forEach(function (item, index) {
                    Image.findOneAlbumImage(item, function (err, images) {
                        if (err) res.send(err);
                        if (images) {
                            item.amount = images.length;
                            albums.push(item);
                        }
                    });
                });
            } else {
                res.send('');
            }
            res.render('admin_gallery', {adminPath: adminPath, locals: res.locals, albums: a});
        });
    });

    router.post('/gallery/new', auth_user, function (req, res, next) {
        var name = req.body.name;
        var desc = req.body.desc;
        var cover = req.body.cover;
        var private = req.body.private ? true : false;
        Album.addAlbum(name, desc, private, function (err) {
            if (err) res.send(err);
            res.redirect(adminPath+'/gallery');
        });
    });

    router.get('/gallery/:album', auth_user, function (req, res, next) {
        var album = req.params.album;
        Album.getOneAlbum(album, function (err, a) {
            if (err) {
                res.send(err);
                return false;
            } 
            if (a) {
                Image.findOneAlbumImage(a, function (err, images) {
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
            }
        });
    });

    router.post('/gallery/upload/:album', auth_user, function (req, res, next) {
        var album = req.params.album;

        upload.fileHandler({
            uploadDir: function () {
                return root + '/gallery/' + album;
            },
            uploadUrl: req.url
        })(req, res, next);
        console.log(req.body);
    });
};