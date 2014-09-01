var mongoose = require('mongoose'),
    Setting = require('../models').Setting,
    Category = require('../models').Category,
    config = require('../../../config').config,
    root = config.root_dir,
    errorHandling = require('../utils/error');


function route (app, req, res, next) {

    app.use(config.url.admin, function (req, res, next) {
        app.set('views', root + '/core/client');
        next();
    });
    app.use(config.url.admin, require('../controller/admin'));

    app.use('/', function (req, res, next) {
        var dir = root + '/content/themes/' + app.locals.setting.theme;
        app.set('views', dir);
        next();
    });
    app.use('/', require('../controller/index'));

    app.use('*', function (req, res, next) {
        errorHandling(req, res, {
            error: '你请求的页面不存在。',
            type: 404
        });
    });

    Category.getAll(function (err, c) {
        if (err) {
            errorHandling(req, res, {error: err, type: 500});
            return false;
        }
        if (c.length === 0) {
            Category.createNew('未分类', function (err) {
                if (err) console.error(c);               
            });
        }
    });
}


module.exports = route;