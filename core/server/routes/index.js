var mongoose = require('mongoose'),
    config = require('../../../config').config,
    root = config.root_dir,
    errorHandling = require('../utils/error');


function route (app) {

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

}
module.exports = route;