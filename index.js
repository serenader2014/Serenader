var Promise = require('bluebird'),
    mongoose = require('mongoose'),
    fs = Promise.promisifyAll(require('fs')),
    models = require('./core/server/models/index'),
    Post = models.Post,
    Setting = models.Setting,
    Category = models.Category,

    config = require('./config').config,
    settings;

function ConnectDB () {
    console.log('Initialize system...');
    return new Promise(function (resolve, reject) {
        mongoose.connect(config.db, function (err) {
            if (err) {
                reject(err);
            } else {
                console.log('Mongodb connected successfully.');
                resolve();
            }
        });
    });
}

function makeFolders (dir) {
    console.log('making folder: ' + dir);
    return fs.mkdirAsync(dir).catch(Promise.OperationalError, function (err) {
        if (err.cause.code === 'ENOENT') {
            var tmp = dir.split('/'), newDir;
            tmp.pop();
            newDir = tmp.join('/');
            return makeFolders(newDir);
        } else if (err.cause.code === 'EEXIST') {
            console.log('ignore existing folder:' + dir);
        } else {
            throw new Error(err.message);
        }

    });
}

ConnectDB().then(function () {
    return Setting.getSetting();
}).then(function (setting) {
    if (!setting) {
        console.log('Creating default settings');
        settings = config.blogConfig;
        return Setting.createSetting(config.blogConfig);
    } else {
        settings = setting;
    }
}).then(function () {
    Category.getAll().then(function (category) {
        if (!category.length) {
            console.log('Creating default category');
            return Category.createNew('默认');
        }
    });
}).catch(function (err) {
    console.log(err);
    process.exit(1);
    return false;
}).then(function () {
    var dir = config.dir,
        root = config.root_dir;

    dir.reduce(function (sequence, dirPath) {
        return sequence.then(function () {
            return makeFolders(dirPath);
        });
    }, Promise.resolve());
}).then(function (){
    require('./core/server')(settings);
});