module.exports = function (setting) {
    var express   = require('express'),
    logger        = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    session       = require('express-session'),
    MongoStore    = require('connect-mongo')(session),

    route         = require('./routes'),
    config        = require('../../config').config,
    errorHandling = require('./utils/error'),
    log           = require('./utils/log')(),

    app           = express(),
    theme, dir, server;

    app.set('view engine', 'jade');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(logger('dev'));
    app.use(session({
        name: 'blog session',
        secret: config.session_secret,
        store: new MongoStore({
            url: config.db
        }),
        resave: true,
        saveUninitialized: true
    }));

    // 验证访客是否已经登录。
    app.use(function (req, res, next) {
        if (req.session.user) {
            app.locals.currentUser ={
                uid: req.session.user.uid,
                avatar: req.session.user.avatar,
                role: req.session.user.role,
                email: req.session.user.email
            };
            req.session.cookie.expires = new Date(Date.now()+1000*60*30);
            req.session.cookie.maxAge = 1000*60*30;
        }
        next();
    });

    // 缓存全局的系统URL，将会在模板文件中使用到。
    app.locals.url = config.url;
    app.locals.assets = {
        client: config.assetsUrl.clientSideAssets,
        server: config.assetsUrl.serverSideAssets,
        static: config.assetsUrl.staticFile
    };

    module.exports.setting = app.locals.setting = setting;

    module.exports.locals = app.locals;
    theme = setting.theme;

    // 前台的静态文件托管服务。
    app.use(config.assetsUrl.clientSideAssets, function (req, res, next) {
        dir = config.root_dir + '/content/themes/' + theme + '/assets/';
        express.static(dir)(req, res, next);
    });
    // 后台的静态文件托管服务。
    app.use(config.assetsUrl.serverSideAssets, express.static(config.root_dir + '/core/view/assets/'));
    // 公开的静态文件托管服务。
    app.use(config.assetsUrl.staticFile, express.static(config.root_dir + '/content/data/public/'));
    // 验证是否已经登录且是否为该资源的拥有者。
    app.use(config.assetsUrl.staticFile + '/:user/*', function (req, res, next) {
        var user = req.params.user;
        if (req.session.user && req.session.user.uid === user) {
            next();
        } else {
            errorHandling(req, res, {type: 404, error: 'Not found'});
        }
    });
    // 私密的静态文件托管服务。
    app.use(config.assetsUrl.staticFile, express.static(config.root_dir + '/content/data/private'));

    // 路由控制。
    route(app);

    app.set('port', config.port);

    // 端口绑定。
    server = app.listen(app.get('port'), function () {
        log.info('Express server listenning on port '+ server.address().port);
    });
};