var upload = require('blueimp-file-upload-expressjs');
var validator = require('validator');
var xss = require('xss');

var auth_user = require('./index').auth_user;
var adminPath = require('./index').adminPath;
var Album = require('../../proxy').album;
var Image = require('../../proxy').image;

var root = require('../../config').config.root_dir + '/data/';

var errorHandling = require('../../routes').error;

var userName,album;

module.exports = function (router) {
    router.get('/gallery', auth_user, function (req, res, next) {
        var userName = req.session.user.uid;
        Album.getUserAllAlbum(userName, function (err, a) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            if (a) {
                res.render('admin_gallery', {adminPath: adminPath, locals: res.locals, albums: a});
            } else {
                errorHandling(res, { error: '找不到该相册。', type: 404});
                return false;
            }
        });
    });

    router.post('/gallery/new', auth_user, function (req, res, next) {
        var name = validator.trim(xss(req.body.name));
        var desc = validator.trim(xss(req.body.desc));
        var userName = req.session.user.uid;
        var private = req.body.private ? true : false;
        Album.addAlbum({
            name: name,
            desc: desc,
            user: userName,
            private: private
        }, function (err) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            res.redirect(adminPath+'/gallery');
        });
    });

    router.get('/gallery/:album', auth_user, function (req, res, next) {
        var album = validator.trim(xss(decodeURIComponent(req.params.album)));
        var userName = req.session.user.uid;
        Album.getOneAlbum(album, function (err, a) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            } 
            if (a) {
                if (a.user === userName || userName === 'admin') {
                    Image.findOneAlbumImage(a.name, function (err, images) {
                        if (err) {
                            errorHandling(res, { error: err, type: 500});
                            return false;
                        }
                        res.render('admin_one_album', {
                            adminPath: adminPath,
                            locals: res.locals,
                            images: images,
                            album: a
                        });
                    });
                } else {
                    res.redirect(adminPath+'/gallery');
                }
            }
        });
    });

    router.post('/gallery/upload/:album', auth_user, function (req, res, next) {
        album =  validator.trim(xss(decodeURIComponent(req.params.album)));
        userName = req.session.user.uid;
        // var desc = validator.trim(xss(req.body.desc));

        Album.getOneAlbum(album, function (err, a) {
            if (err) {
                errorHandling(res, { error: err, type: 500});
                return false;
            }
            if (a) {
                if (a.user === userName) {
                    var type = a.private ? 'private' : 'public';

                    var opt = {
                        tmpDir: root + 'tmp',
                        uploadDir: root + type + '/' + userName + '/gallery/' + album,
                        uploadUrl: req.url,
                        maxPostSize: 11000000000,
                        minFileSize:  1,
                        maxFileSize:  10000000000,
                        acceptFileTypes:  /.+/i,
                        inlineFileTypes:  /\.(gif|jpe?g|png)/i,
                        imageTypes:  /\.(gif|jpe?g|png)/i,
                        imageVersions: {
                            width:  150,
                            height: 150
                        },
                        accessControl: {
                            allowOrigin: '*',
                            allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
                            allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
                        },
                    };

                    var uploader = upload(opt);

                    uploader.post(req, res, function (fileInfo) {
                        fileInfo.files.forEach(function (file, index) {
                            Image.addImage({
                                path: '/static/'+userName+'/gallery/'+ album + '/' + file.name,
                                desc: '',
                                album: album
                            }, function (err) {
                                if (err) {
                                    console.error(err);
                                    return false;
                                }
                                res.send(fileInfo);
                            });
                        });
                    });

                    

                } else {
                    errorHandling(res, { error: '您无权上传图片到该相册中。', type: 403});
                    return false;
                }

            } else {
                errorHandling(res, { error: '找不到该相册。', type: 404});
                return false;
            }
        });
    });

};