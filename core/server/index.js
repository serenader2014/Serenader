var express = require('express'),
    path = require('path'),
    fs = require('fs'),
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
    errorHandling = require('./utils/error');

    app = express();


// create the necessary folders
mk(config.dir, function () {
    console.log('make folders success');
});

// connect to the mongodb
mongoose.connect(config.db, function (err) {
    if (err) {
        console.error('connect to %s error: ',config.db,err.message);
        process.exit(1);
    }
});

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

Setting.getSetting(function (err, s) {
    var theme, dir;
    if (err) {
        console.error(err);
        res.send(err);
        return false;
    }
    if (!s) {
        Setting.createSetting(config.blogConfig, function (err, setting) {
            if (err) {
                errorHandling(req, res, {error: err, type: 500});
                return false;
            }
        });
        app.locals.setting = config.blogConfig;
    } else {
        app.locals.setting = s;
    }
    module.exports = app.locals;
    theme = app.locals.setting.theme;

    app.use(function (req, res, next) {
        var theme = app.locals.setting.theme,
            dir = config.root_dir + '/content/themes/' + theme + '/assets';
        express.static(dir)(req, res, next);
    });
    app.use(express.static(config.root_dir + '/core/client/assets'));
    app.use('/static', express.static(config.root_dir + '/content/data/public'));
    app.use('/static/:user/*', function (req, res, next) {
        var url = req.url.split('/static/')[1];
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

    var server = app.listen(app.get('port'), function () {
        console.log('Express server listenning on port '+ server.address().port);
    });
});

