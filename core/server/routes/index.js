var mongoose = require('mongoose'),
    Setting = require('../models').Setting,
    Category = require('../models').Category,
    config = require('../../../config').config,
    root = config.root_dir,
    app = require('../index');
    errorHandling = require('../utils/error');


function route (app, req, res, next) {
    Setting.getSetting(function (err, setting) {
        if (err) process.exit(1);

        app.locals.adminPath = config.url.admin;

        app.use(app.locals.adminPath, function (req, res, next) {
            app.set('views', root + '/core/client');
            next();
        });
        app.use(app.locals.adminPath, require('../controller/admin'));

        app.use('/', function (req, res, next) {
            var theme = setting.theme || config.theme,
                dir = root + '/content/themes/' + theme;
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
    });

    Category.getAll(function (err, c) {
        if (err) console.error(err);
        if (c.length === 0) {
            Category.createNew('未分类', function (err) {
                if (err) console.error(c);               
            });
        }
    });
}


module.exports = route;