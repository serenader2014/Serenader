var im = require('imagemagick'),
    formidable = require('formidable'),
    path = require('path'),
    fs = require('fs'),
    auth_user = require('../../utils/auth_user'),
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
                width: 100,
            },
            'small': {
                width: 500,
            }
        },
    },
    nameCountReg = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/,
    nameCountFunc = function (s, index, ext) {
        return '(' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
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
    this.name = path.basename(this.name).replace(/^\.+/,'');

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
            path: '/static/' + req.session.user.uid + '/upload'
        }, function (files, field) {
            res.json(files);
        });
    });

    router.delete(url.adminPostUpload + '/*', auth_user, function (req, res, next) {
        var file = path.basename(decodeURIComponent(req.url)),
            dir = uploadDir(req);
        if (file) {
            fs.unlink(dir + '/' + file, function (e) {
                Object.keys(options.imageVersions).forEach(function (version) {
                    fs.unlink(dir + '/' + version + '/' + file);
                });
                res.json({
                    status: 1
                });
            });
        }
    });


};

var fileUpload = module.exports.fileUpload = function (req, res, opt, callback) {
    // opt = {
    //     uploadDir: 'aaa',
    //     path: 'aa'
    // }
    var form = new formidable.IncomingForm(),
        uploadDir = opt.uploadDir,
        tmpFiles = [],
        files = [],
        map = [],
        counter = 1,
        field = [],
        setNoCacheHeaders = function () {
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.setHeader('Content-Disposition', 'inline; filename="files.json"');
        };

    form.uploadDir = options.tmpDir;

    form.parse(req);

    form.on('fileBegin', function (name, file) {
        var fileinfo = new FileInfo(file);
        tmpFiles.push(file.path);
        fileinfo.safeName(uploadDir);
        map[path.basename(file.path)] = fileinfo;
        files.push(fileinfo);
    }).on('field', function (name, value) {
        var f = {};
        f[name] = value;
        field.push(f);
    }).on('file', function (name, file) {
        var fileinfo = map[path.basename(file.path)];
        fileinfo.size = file.size;

        if (! fileinfo.validate(options.imageTypes)) {
            fs.unlink(file.path);
            return false;
        }

        fs.renameSync(file.path, uploadDir + '/' + fileinfo.name);

        if (options.imageTypes.test(fileinfo.name)) {
            Object.keys(options.imageVersions).forEach(function (version) {
                if (! fs.existsSync(uploadDir + '/' + version)) {
                    fs.mkdirSync(uploadDir + '/' + version);
                }
                var opt = options.imageVersions[version];
                im.resize({
                    width: opt.width,
                    srcPath: uploadDir + '/' + fileinfo.name,
                    dstPath: uploadDir + '/' + version + '/' + fileinfo.name
                }, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        }

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
        callback(files, field);
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
};