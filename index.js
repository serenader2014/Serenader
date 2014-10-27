var Promise = require('bluebird'),
    mongoose = require('mongoose'),
    fs = Promise.promisifyAll(require('fs')),
    fsx = Promise.promisifyAll(require('fs-extra')),
    models = require('./core/server/models'),
    Post = models.Post,
    Setting = models.Setting,
    Category = models.Category,
    log = require('./core/server/utils/log')(),

    config = require('./config').config,
    settings;


function ConnectDB () {
    log.info('Initialize system...');
    return new Promise(function (resolve, reject) {
        mongoose.connect(config.db, function (err) {
            if (err) {
                reject(err);
            } else {
                log.success('Mongodb connected successfully.');
                resolve();
            }
        });
    });
}

// First initialize the system, connect to database, create some necessary database records
// and folders, then run the core server.

// connect to mongodb
ConnectDB().then(function () {
    return Setting.getSetting();
}).then(function (setting) {
    if (!setting) {
        // create default settings if the database haven't store any record
        log.info('Creating default settings');
        settings = config.blogConfig;
        return Setting.createSetting(config.blogConfig);
    } else {
        settings = setting;
    }
}).then(function () {
    return Category.getAll().then(function (category) {
        if (!category.length) {
            // create default category if the database haven't store any record
            log.info('Creating default category');
            return Category.createNew('默认');
        }
    });
}).catch(function (err) {
    // If it can't pass the initialize checking, it will 
    // force exiting the process.
    log.error('Initialize the system failed, please check your environment.');
    log.error(err.message);
    process.exit(1);
    return false;
}).then(function () {
    var dir = config.dir,
        root = config.root_dir;
    // make some folders if they don't exist
    return dir.reduce(function (sequence, dirPath) {
        return sequence.then(function () {
            log.success('Making folder:' + dirPath);
            return fsx.mkdirsAsync(root + dirPath);
        });
    }, Promise.resolve());
}).then(function (){
    // run the core server
    require('./core/server')(settings);
});