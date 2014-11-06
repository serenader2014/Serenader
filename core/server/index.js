module.exports = function (setting) {
    var express = require('express'),
        logger = require('morgan'),
        cookieParser = require('cookie-parser'),
        bodyParser = require('body-parser'),
        session = require('express-session'),
        MongoStore = require('connect-mongo')(session),

        route = require('./routes'),
        config = require('../../config').config,
        errorHandling = require('./utils/error'),
        log = require('./utils/log')(),

        app = express(),
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
    // validate whether the visitor has logged in or not
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

    // cache the global system url, will be used in the jade file
    app.locals.url = config.url;
    app.locals.assets = {
        client: config.assetsUrl.clientSideAssets,
        server: config.assetsUrl.serverSideAssets
    };

    module.exports.setting = app.locals.setting = setting;

    module.exports.locals = app.locals;
    theme = setting.theme;

    app.use(config.assetsUrl.clientSideAssets, function (req, res, next) {
        dir = config.root_dir + '/content/themes/' + theme + '/assets';
        express.static(dir)(req, res, next);
    });
    app.use(config.assetsUrl.serverSideAssets, express.static(config.root_dir + '/core/build'));
    app.use(config.assetsUrl.staticFile, express.static(config.root_dir + '/content/data/public'));
    app.use(config.assetsUrl.staticFile + '/:user/*', function (req, res, next) {
        var user = req.params.user;
        if (req.session.user && req.session.user.uid === user) {
            next();
        } else {
            errorHandling(req, res, {type: 404, error: 'Not found'});
        }
    });
    app.use(config.assetsUrl.staticFile, express.static(config.root_dir + '/content/data/private'));


    route(app);


    app.set('port', config.port);

    server = app.listen(app.get('port'), function () {
        log.info('Express server listenning on port '+ server.address().port);
    });
};