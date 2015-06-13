var Promise  = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));
var fs       = Promise.promisifyAll(require('fs-extra'));
var models   = require('./core/server/models');
var Setting  = models.Setting;
var Category = models.Category;
var User     = models.User;
var log      = require('./core/server/utils/log')();
var config   = global.config = require('./config');

global.production = process.env.NODE_ENV === 'production' ? true : false;


/**
 * 首先初始化系统，连接到 MongoDB。并且创建一些必要的表和初始数据。
 * 另外创建系统所需要的文件夹等。然后启动核心服务。
 */
mongoose.connectAsync(config.db).then(function () {

    return Setting.getSetting();

}).then(function (setting) {

    if (!setting) {
        // 如果数据库中没有设置的记录的话，则创建初始设置。
        log.info('Creating default settings');
        global.settings = config.blogConfig;
        return Setting.create(config.blogConfig);
    } else {
        global.settings = setting;
    }

}).then(function () {

    return Category.getAll().then(function (category) {
        if (!category.length) {
            // 创建初始分类，如果系统没有任何分类的话。
            log.info('Creating default category');
            return Category.create('默认');
        }
    });

}).then(function () {

    return User.getAllUser().then(function (users) {
        global.initialized = !!users.length;
    });

}).catch(function (err) {

    // 如果上面的步骤出现错误，则会抛出错误并且强制退出系统。
    log.error('Initialize the system failed, please check your environment.');
    log.error(err.message);
    process.exit(1);
    return false;

}).then(function () {

    var dir  = config.dir;
    var root = config.root_dir;
    // 创建一些文件夹，如果他们不存在的话。
    return dir.reduce(function (sequence, dirPath) {
        return sequence.then(function () {
            return fs.mkdirsAsync(root + dirPath);
        });
    }, Promise.resolve());

}).then(function (){
    // 启动核心服务。
    require('./core/server')();
    
});