var express = require('express');
var mongoose = require('mongoose');
var admin = require('../controller/admin');
var config = require('../config').config;
var Setting = require('../proxy').setting;
var adminPath;




function route (app, req, res, next) {
    Setting.getSetting(function (err, s) {
        if (err) {
            console.error(err);
        }
        module.exports.adminPath = adminPath = s ? s.admin_path : config.admin_path;
        // 后台面板的路径可自由设置。
        app.use(adminPath, admin);
    })
}


module.exports = route;