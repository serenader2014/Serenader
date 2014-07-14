var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(session);


var upload = require('jquery-file-upload-middleware'),
    config = require('./config'),
    route = require('./routes'),
    mongooseSession = require('./mongoose_session');

mongoose.connect(config.db, function (err) {
    if (err) {
        console.error('connect to %s error: ',config.db,err.message);
        process.exit(1);
    }
});


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

upload.configure({
    uploadDir: config.upload_dir,
    uploadUrl: "/files",
    imageVersions: {
        thumbnail: {
            width: 100,
            height: 100
        }
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(logger('dev'));
app.use(session({
    name: 'blog session',
    secret: config.session_secret,
    store: new MongoStore({
        db: "db",
    }),
    resave: true,
    saveUninitialized: true,
}));

app.use(function (req, res, next) {
    if (req.session.user) {
        res.locals.current_user = req.session.user;
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files/', express.static(path.join(__dirname, '/upload')));


app.use('/upload', upload.fileHandler());


route(app);

app.set('port', config.port);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listenning on port '+ server.address().port);
});