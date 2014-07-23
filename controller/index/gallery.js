var Album = require('../../proxy').album;
var Image = require('../../proxy').image;
var express = require('express');
var root = require('../../config').config.root_dir;

module.exports = function (router) {
    router.get('/gallery', function (req, res, next) {
        if (req.session.user) {
            Album.getAllAlbum(function (err, a) {
                res.render('gallery', {albums: a});
            });
        } else {
            Album.getPublicAlbum(function (err, a) {
                res.render('gallery', {albums: a});
            });
        }
    });

    router.get('/gallery/:album', function (req, res, next) {
        var name = req.params.album;

        Album.getOneAlbum(name, function (err, a) {
            if (! err && a) {
                if (a.private === true) {
                    if (req.session.user) {
                        Image.findOneAlbumImage(name, function (err, i) {
                            if (! err && i) {
                                res.render('gallery', {album: a, images: i});
                            } else {
                                res.send(err ? err : 'no image');
                            }
                        });
                    } else {
                        next();
                    }
                } else {
                    
                }
            } else {
                res.send(err ? err : 'no album');
            }
        });
    });

    router.get('/gallery/:user/:album/:file', function (req, res, next) {
        var userName = req.params.user;
        var album = req.params.album;
        var file = req.params.file;
        // console.log('get gallery');
        // Album.getOneAlbum(album, function (err, a) {
        //     if (err) {
        //         res.send(err);
        //         return false;
        //     }
        //     if (a) {
        //         Image.findOneAlbumImage(a.name, function (err, images) {

        //         });
        //     }
        // });
        res.send(root + '/data/' + userName + '/gallery/' + album + '/' + file);
        express.static(root + '/data/' + userName + '/gallery/' + album)(req, res, next);
    });
};