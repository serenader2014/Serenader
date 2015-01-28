module.exports = function (req, res, opt) {
    var Promise = require('bluebird'),
        im = Promise.promisifyAll(require('imagemagick')),
        formidable = require('formidable'),
        path = require('path'),
        fsx = Promise.promisifyAll(require('fs-extra')),
        _ = require('lodash'),
        log = require('./log')(),
        config = require('../../../config').config,
        root = config.root_dir,
        defaultOptions = {
            tmpDir: path.resolve(root, 'content', 'data', 'tmp'),
            uploadDir: path.resolve(root, 'content', 'data', 'upload'),
            deleteUrl: '/upload/public/',
            baseUrl: '/',
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
        options = {},
        nameCountReg = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/,
        nameCountFunc = function (s, index, ext) {
            return ((parseInt(index, 10) || 0) + 1) + (ext || '');
        },
        form = new formidable.IncomingForm(),
        tmpFiles = [],
        files = [],
        map = [],
        field = {},
        p,
        FileInfo = function (file) {
            this.name = file.name;
            this.size = file.size;
            this.type = file.type;
            this.deleteType = 'DELETE';
        };

    _.extend(options, defaultOptions, opt);


    FileInfo.prototype.validate = function () {
        if (options.minFileSize && options.minFileSize > this.size) {
            this.error = 'File is too small';
        } else if (options.maxFileSize && options.maxFileSize < this.size) {
            this.error = 'File is too big';
        } else if (!options.acceptFileTypes.test(this.name)) {
            this.error = 'Filetype is not allowed';
        }
        return !this.error;
    };

    FileInfo.prototype.safeName = function () {
        this.name = path.basename(this.name).replace(/^\.+/,'').replace(/(|)/, '');

        if (fsx.existsSync(options.uploadDir + '/' + this.name)) {
            this.name = this.name.replace(nameCountReg, nameCountFunc);
        }
    };

    FileInfo.prototype.initUrls = function () {
        if (! this.error) {
            var self = this;
            this.url = options.baseUrl + '/' + this.name;
            this.deleteUrl = options.deleteUrl + '/' + encodeURIComponent(this.name);
            this.imageVersions = {};
            _.forEach(_.keys(options.imageVersions), function (version) {
                if (!options.imageTypes.test(self.name)) {
                    return false;
                }
                self.imageVersions[version] = options.baseUrl + '/' + version + '/' + encodeURIComponent(self.name);
            });
        }
    };

    return new Promise(function (resolve, reject) {
        form.uploadDir = options.tmpDir;
        form.on('fileBegin', function (name, file) {

            var fileinfo = new FileInfo(file);
            tmpFiles.push(file.path);
            fileinfo.safeName();
            map[path.basename(file.path)] = fileinfo;
            files.push(fileinfo);

        }).on('field', function (name, value) {

            field[name] = value;

        }).on('file', function (name, file) {

            var fileinfo = map[path.basename(file.path)];
            fileinfo.size = file.size;

            if (! fileinfo.validate()) {
                fsx.unlink(file.path);
                return false;
            }

            p = fsx.ensureDirAsync(options.uploadDir).then(function () {
                return fsx.renameAsync(file.path, path.join(options.uploadDir, fileinfo.name));
            }).then(function () {
                if (!options.imageTypes.test(fileinfo.name)) {
                    return;
                }
                return Object.keys(options.imageVersions).reduce(function (promise, version) {
                    return promise.then(function () {
                        return fsx.ensureDirAsync(path.join(options.uploadDir, version)).then(function () {
                            return im.resizeAsync({
                                width: options.imageVersions[version].width,
                                srcPath: path.join(options.uploadDir, fileinfo.name),
                                dstPath: path.join(options.uploadDir, version, fileinfo.name)
                            });
                        });
                    });
                }, Promise.resolve());
            });

        }).on('aborted', function () {

            tmpFiles.forEach(function (file) {
                fsx.unlink(file);
            });
            reject();

        }).on('progress', function (bR, bE) {

        }).on('error', function (e) {

            log.error(e.stack);
            reject(e);

        }).on('end', function () {

            p.then(function () {
                _.forEach(files, function (fileinfo) {
                    fileinfo.initUrls(req, opt.uploadDir, opt.path);
                });
                resolve(files, field);
            }).catch(function (err) {
                log.error(err.stack);
                reject(err);
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
    });
};