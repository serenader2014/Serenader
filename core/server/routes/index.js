var config    = require('../../../config').config,
root          = config.root_dir,
errorHandling = require('../utils/error');


function route (app) {

    /**
     * 系统响应时间监控
     * 在每个页面请求中，HTTP响应头中的 X-Time 则代表了系统接收到请求后，
     * 到发送出响应的这个响应时间。
     */
    app.use(function (req, res, next) {
        var _send = res.send,
            startTime = Date.now();

        res.send = function () {
            res.set('X-Time', String(Date.now() - startTime) +  'ms');
            return _send.apply(res, arguments);
        };

        next();
    });

    /**
     * 设置后台的模板文件存储路径
     * 引入后台的所有路由控制。
     */
    app.use(config.url.admin, function (req, res, next) {
        app.set('views', root + '/core/view/');
        next();
    });
    app.use(config.url.admin, require('../controller/admin'));

    /**
     * 设置前台的模板文件的存储路径
     * 引入前台的所有路由控制。
     */
    app.use('/', function (req, res, next) {
        var dir = root + '/content/themes/' + app.locals.setting.theme;
        app.set('views', dir);
        next();
    });
    app.use('/', require('../controller/index'));

    /**
     * API 的路由控制。
     */
    app.use(config.url.api, require('../controller/api'));

    /**
     * 404 页面的处理。
     */
    app.use('*', function (req, res) {
        errorHandling(req, res, {
            error: '你请求的页面不存在。',
            type: 404
        });
    });

}
module.exports = route;