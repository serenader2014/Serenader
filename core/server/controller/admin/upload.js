var im = require('imagemagick'),
    formidable = require('formidable'),
    path = require('path'),
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
                height: 100,
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


module.exports = function (router) {

    router.post(url.adminUpload, auth_user, function (req, res, next) {
        uploadImg(req, res, {
            uploadDir: ''
        });
    });


};

var uploadImg = module.exports.uploadImg = function (req, res, opt) {
    var form = new formidable.IncomingForm(),
        uploadDir = root + '/content/data/' + req.session.user.uid + '/upload' + opt.uploadDir ,
        tmpFiles = [],
        files = [],
        map = [],
        counter = 1,
        setNoCacheHeaders = function () {
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.setHeader('Content-Disposition', 'inline; filename="files.json"');
        };

    form.uploadDir = options.tmpDir;

    // form.on('fileBegin', function (name, file) {
    //     tmpFiles.push(file.path);
    //     var fileinfo = new FileInfo(file);
    //     fileinfo.safeName(uploadDir);
    //     map[path.basename(file.path)] = fileinfo;
    //     files.push(fileinfo);
    //     console.log(files);
    // }).on('field', function () {

    // }).on('file', function (name, file) {

    // }).on('aborted', function () {

    // }).on('error', function () {

    // }).on('progress', function () {

    // }).on('end', function () {
    //     console.log(arguments);
    // });
    form.parse(req, function () {
        console.log(arguments);
    });
};