var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(session),
    Promise = require('bluebird'),

    mk = require('./utils/makefolder'),
    route = require('./routes'),
    Setting = require('./models').Setting,
    config = require('../../config').config,
    errorHandling = require('./utils/error');

    app = express();


// create the necessary folders
function initFolders ()  {
    mk(config.dir, function () {
        console.log('make folders success');
    });
}
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

var getSetting = new Promise (function (resolve, reject) {
    Setting.getSetting(function (err, s) {
        if (err)  {
            reject(err);
        } else {
            if (!s) {
                reject('No setting');
            } else {
                resolve(s);
            }
        }
    });
});

getSetting.then(function (setting) {
    app.locals.setting = setting;
    return app.locals.setting;
}).catch(function (err) {
    if (err === 'No setting') {
        return new Promise(function (resolve, reject) {
            Setting.createSetting(config.blogConfig, function (err, setting) {
                if (err) {
                    reject(err);
                    errorHandling(req, res, {error: err, type: 500});
                    return false;
                }
                app.locals.setting = config.blogConfig;
                resolve(app.locals.setting);
            });
        });
    } else {
        throw new Error(err);
    }
}).then(function (setting) {
    var theme, dir, server;

    module.exports = app.locals;
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

});