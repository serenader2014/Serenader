var express = require('express');
var mongoose = require('mongoose');
var admin = require('../controller/admin');
var Setting = require('../proxy').setting;
var config = require('../config');

var adminPath;

Setting.getSetting(function (err, s) {
    adminPath = s ? s.admin_path : config.admin_path;
})


function route (app, req, res, next) {
    app.use(adminPath, admin);
}

module.exports = route;