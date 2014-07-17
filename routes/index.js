var express = require('express');
var mongoose = require('mongoose');
var config = require('../config').config;
var Setting = require('../proxy').setting;
var Category = require('../proxy').category;




function route (app, req, res, next) {
    Setting.getSetting(function (err, setting) {
        if (err) process.exit(1);

        app.locals.adminPath = (setting && setting.admin_path) ? setting.admin_path : config.admin_path;

        app.use(app.locals.adminPath, require('../controller/admin'));
        app.use('*', function (req, res, next) {
            // TODO customize 404 not found 
            res.send(404,'error 404 not found');
        });
    });

    Category.getAllCategories(function (err, c) {
        if (err) console.error(err);
        if (c.length === 0) {
            Category.createNewCategory('未分类', function (err) {
                if (err) console.error(c);               
            });
        }
    });
}


module.exports = route;