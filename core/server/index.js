module.exports = function (setting) {
    var express = require('express'),
        logger = require('morgan'),
        cookieParser = require('cookie-parser'),
        bodyParser = require('body-parser'),
        session = require('express-session'),
        mongoose = require('mongoose'),
        MongoStore = require('connect-mongo')(session),

        mk = require('./utils/makefolder'),
        route = require('./routes'),
        Setting = require('./models').Setting,
        config = require('../../config').config,
        errorHandling = require('./utils/error'),

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
        saveUninitialized: true,
    }));
    // validate wheather the visitor has logined or not
    app.use(function (req, res, next) {
        if (req.session.user) {
            app.locals.currentUser = req.session.user;
            req.session.cookie.expires = new Date(Date.now()+1000*60*30);
            req.session.cookie.maxAge = 1000*60*30;
            res.cookie('serenader','0.1',{
                maxAge: 1000*60*30,
                expires: new Date(Date.now()+1000*60*30)
            });
        }
        next();
    });

    // cache the global system url, will be used in the template file
    app.locals.url = config.url;

    module.exports.setting = app.locals.setting = setting;

    module.exports.locals = app.locals;
    theme = setting.theme;

    app.use(function (req, res, next) {
        dir = config.root_dir + '/content/themes/' + theme + '/assets';
        express.static(dir)(req, res, next);
    });
    app.use(express.static(config.root_dir + '/core/client/assets'));
    app.use('/static', express.static(config.root_dir + '/content/data/public'));
    app.use('/static/:user/*', function (req, res, next) {
        var user = req.params.user;
        if (req.session.user && req.session.user.uid === user) {
            next();
        } else {
            errorHandling(req, res, {type: 404, error: 'Not found'});
        }
    });
    app.use('/static', express.static(config.root_dir + '/content/data/private'));


    route(app);


    app.set('port', config.port);

    server = app.listen(app.get('port'), function () {
        console.log('Express server listenning on port '+ server.address().port);
    });
};