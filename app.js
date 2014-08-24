var express = require('express');
var path = require('path');
var fs = require('fs');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);


var config = require('./config').config;
var Setting = require('./proxy').setting;

var app = express();
module.exports = app;

var mk = module.exports.makeFolder = function (dir, callback) {
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
            fs.mkdir(__dirname + d, function (err) {
                if (err && err.code !== 'EEXIST') {
                    console.error(err);
                    console.log(__dirname + d);
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

mk(config.dir, function () {
    console.log('make folder success');
});

mongoose.connect(config.db, function (err) {
    if (err) {
        console.error('connect to %s error: ',config.db,err.message);
        process.exit(1);
    }
});


var route = require('./routes');




app.set('views', path.join(__dirname, 'views'));
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

app.use(function (req, res, next) {
    if (req.session.user) {
        res.locals.current_user = req.session.user;
        req.session.cookie.expires = new Date(Date.now()+1000*60*30);
        req.session.cookie.maxAge = 1000*60*30;
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'data/public')));
app.get('/static/*', function (req, res, next) {
    var url = req.url.split('/static/')[1];
    var user = url.substring(0, url.indexOf('/'));
    if (req.session.user && req.session.user.uid === user) {
        next();
    } else {
        res.send(404, 'not found');
    }
});
app.use('/static', express.static(path.join(__dirname, 'data/private')));

route(app);


app.set('port', config.port);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listenning on port '+ server.address().port);
});
