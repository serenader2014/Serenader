var fs = require('fs');
var root = require('../../../config').config.root_dir;

module.exports = function (dir, callback) {
    if (typeof dir === 'string') {
        makefolder(dir, callback);
    } else if (Object.prototype.toString.call(dir) === '[object Array]') {
        dir.forEach(function (d, index) {
            if (index === dir.length - 1) {
                makefolder(d, callback);
            } else {
                makefolder(d);
            }
        });
    }
    function makefolder (dir, cb) {
        var dirArr = [];
        var tmp = '';
        dir.split('/').forEach(function (d) {
            tmp = tmp + '/' + d;
            dirArr.push(tmp);
        });
        dirArr.forEach(function (d, index) {
            fs.mkdir(root + d, function (err) {
                if (err && err.code !== 'EEXIST') {
                    console.error(err);
                    console.log(root + d);
                }
                if (index === dirArr.length - 1) {
                    if (cb && typeof cb === 'function') {
                        cb();
                    }
                }
            });
        });
    }
};