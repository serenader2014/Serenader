var express = require('express');
var rootRouter = express.Router();

rootRouter.get('/', function (req, res, next) {
    next();
});

require('./gallery')(rootRouter);

module.exports = rootRouter;