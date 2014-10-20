var im = require('imagemagick'),
    formidable = require('formidable'),
    path = require('path'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    fsx = Promise.promisifyAll(require('fs-extra')),
    auth_user = require('../../utils/auth_user'),
    log = require('../../utils/log')(),
    config = require('../../../../config').config,
    root = config.root_dir,
    url = config.url,
    options = {
        tmpDir: root + '/content/data/tmp',
        uploadUrl: url.adminUpload,
        maxPostSize: 11000000000,
        minFileSize: 1,
        maxFileSize: 10000000000,
        acceptFileTypes: /.+/i,
        imageTypes: /\.(gif|jpe?g|png)$/i,
        imageVersions: {
            'thumbnail': {
                width: 250,
            }
        },
    },
    nameCountReg = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/,
    nameCountFunc = function (s, index, ext) {
        return ((parseInt(index, 10) || 0) + 1) + (ext || '');
    },
    FileInfo = function (file) {
        this.name = file.name;
        this.size = file.size;
        this.type = file.type;
        this.deleteType = 'DELETE';
    };

FileInfo.prototype.validate = function (type) {
    if (options.minFileSize && options.minFileSize > this.size) {
        this.error = 'File is too small';
    } else if (options.maxFileSize && options.maxFileSize < this.size) {
        this.error = 'File is too big';
    } else if (!type.test(this.name)) {
        this.error = 'Filetype is not allowed';
    }
    return !this.error;
};

FileInfo.prototype.safeName = function (uploadDir) {
    this.name = path.basename(this.name).replace(/^\.+/,'').replace(/(|)/, '');

    if (fs.existsSync(uploadDir + '/' + this.name)) {
        this.name = this.name.replace(nameCountReg, nameCountFunc);    
    }
};

FileInfo.prototype.initUrls = function (req, uploadDir, path) {
    if (! this.error) {
        var self = this,
            baseUrl =  path;
        this.url = this.deleteUrl = baseUrl + '/' + encodeURIComponent(this.name);
        Object.keys(options.imageVersions).forEach(function (version) {

            if (options.imageTypes.test(self.name)) {
                self[version + 'Url'] = baseUrl + '/' + version + '/' + encodeURIComponent(self.name);
            }
        });
    }
};


module.exports = function (router) {
    var uploadDir = function (req) {
        return root + '/content/data/public/' + req.session.user.uid + '/upload';
    };
    router.post(url.adminPostUpload, auth_user, function (req, res, next) {
        fileUpload(req, res, {
            uploadDir: uploadDir(req),
            path: '/static/' + req.session.user.uid + '/upload',
            typeReg: options.imageTypes
        }, function (err, files, field) {
            if (err) {
                res.json({
                    status: 0,
                    error: err
                });
            } else {
                res.json(files);
            }
        });
    });

    router.delete(url.adminPostUpload + '/*', auth_user, function (req, res, next) {
        var file = path.basename(decodeURIComponent(req.url)),
            dir = uploadDir(req);
        if (file) {
            fs.unlinkAsync(dir + '/' + file).then(function () {
                return Object.keys(options.imageVersions).reduce(function (p, version) {
                    return p.then(function () {
                        return fs.unlinkAsync(dir + '/' + version + '/' + file);
                    });
                }, Promise.resolve());
            }).then(function () {
                res.json({
                    status: 1
                });
            }).catch(function (err) {
                log.error(err.stack);
                res.json({
                    status: 0,
                    error: err.message
                });
            });
        }
    });
};

var fileUpload = module.exports.fileUpload = function (req, res, opt, callback) {
    // opt = {
    //     uploadDir: 'aaa',
    //     path: 'aa',
    //     typeReg: /\.(gif|jpe?g|png)$/i,
    // }
    var form = new formidable.IncomingForm(),
        uploadDir = opt.uploadDir,
        tmpFiles = [],
        files = [],
        map = [],
        counter = 1,
        field = {},
        p,
        setNoCacheHeaders = function () {
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.setHeader('Content-Disposition', 'inline; filename="files.json"');
        };

    form.uploadDir = options.tmpDir;


    form.on('fileBegin', function (name, file) {

        var fileinfo = new FileInfo(file);
        tmpFiles.push(file.path);
        fileinfo.safeName(uploadDir);
        map[path.basename(file.path)] = fileinfo;
        files.push(fileinfo);

    }).on('field', function (name, value) {

        field[name] = value;

    }).on('file', function (name, file) {

        var fileinfo = map[path.basename(file.path)];
        fileinfo.size = file.size;

        if (! fileinfo.validate(opt.typeReg)) {
            fs.unlink(file.path);
            return false;
        }
        if (! fs.existsSync(uploadDir)) {
            fsx.mkdirsSync(uploadDir);
        }
        p = fs.renameAsync(file.path, uploadDir + '/' + fileinfo.name).then(function () {
            if (options.imageTypes.test(fileinfo.name)) {
                return Object.keys(options.imageVersions).reduce(function (p, version) {
                    return fsx.mkdirsAsync(uploadDir + '/' + version).then(function () {
                        var opt = options.imageVersions[version];
                        return new Promise(function (resolve, reject) {
                            im.resize({
                                width: opt.width,
                                srcPath: uploadDir + '/' + fileinfo.name,
                                dstPath: uploadDir + '/' + version + '/' + fileinfo.name
                            }, function (err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        });
                    });
                }, Promise.resolve());
            }
        });

    }).on('aborted', function () {

        tmpFiles.forEach(function (file) {
            fs.unlink(file);
        });

    }).on('progress', function (bR, bE) {

    }).on('error', function (e) {

        console.error(e);

    }).on('end', function () {

        files.forEach(function (fileinfo) {
            fileinfo.initUrls(req, opt.uploadDir, opt.path);
        });
        p.then(function () {
            callback(null, files, field);
        }).catch(function (err) {
            log.error(err.stack);
            callback(err.message, files, field);
        });
        // files = {
        //     deleteType: "DELETE",
        //     deleteUrl: "http://localhost/static/damn/upload/4fjHtYHdRlSemICxjjBu_IMG_8424(1).jpg",
        //     name: "4fjHtYHdRlSemICxjjBu_IMG_8424(1).jpg",
        //     size: 711899,
        //     type: "image/jpeg",
        //     url: "http://localhost/static/damn/upload/4fjHtYHdRlSemICxjjBu_IMG_8424(1).jpg"
        // }
        // field = [
        //     {
        //         something: somevalue
        //     }
        // ]
    });
    form.parse(req);
};
module.exports.imageVersions = options.imageVersions;