var express = require('express');
var mongoose = require('mongoose');
var config = require('../config').config;
var Setting = require('../proxy').setting;





function route (app, req, res, next) {
    Setting.getSetting(function (err, setting) {
        if (err) process.exit(1);
        app.locals.adminPath = (setting && setting.admin_path) ? setting.admin_path : config.admin_path;
        
        app.use(app.locals.adminPath, require('../controller/admin'));

        app.use('*', function (req, res, next) {
            // TODO 404 not found customize
            res.send(404,'error 404 not found');
        });
    });
}


module.exports = route;