var Album = require('../../proxy').album;

module.exports = function (router) {
    router.get('/gallery', function (req, res, next) {
        res.render('gallery');
    });

    router.get('/gallery/:album', function (req, res, next) {
        var name = req.params.album;

        Album.getOneAlbum(name, function (err, a) {
            if (! err && a) {
                if (a.private === true) {
                    next();
                } else {
                    
                }
            } else {
                res.send(err ? err : 'no album');
            }
        });
    });
};