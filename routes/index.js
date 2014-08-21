var express = require('express');
var mongoose = require('mongoose');
var config = require('../config').config;
var Setting = require('../proxy').setting;
var Category = require('../proxy').category;
var User = require('../proxy').user;


function route (app, req, res, next) {
    Setting.getSetting(function (err, setting) {
        if (err) process.exit(1);

        app.locals.adminPath = (setting && setting.admin_path) ? setting.admin_path : config.admin_path;
        app.use(app.locals.adminPath, require('../controller/admin/index'));
        app.use('/', require('../controller/index'));

        app.use('*', function (req, res, next) {
            errorHandling(req, res, {
                error: '你请求的页面不存在。',
                type: 404
            });
        });
    });

    Category.getAll(function (err, c) {
        if (err) console.error(err);
        if (c.length === 0) {
            Category.createNew('未分类', function (err) {
                if (err) console.error(c);               
            });
        }
    });
}


module.exports = route;


// global error handling
var errorHandling = module.exports.error = function (req, res, options) {
    options = options ? options : {error: 'Null', type: 500};
    options.error = options.error ? options.error : 'Null';
    options.type = options.type ? options.type : 500;
    res.status(options.type).render('error', {error: options.error, type: options.type, referer: req.headers.referer});
    return false;
};