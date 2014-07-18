var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Album = require('../../proxy').album;
var Image = require('../../proxy').image;

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
        var private = req.body.private ? true : false;
        Album.addAlbum(name, desc, private, function (err) {
            if (err) res.send(err);
            res.redirect(adminPath+'/gallery');
        });
    });
};