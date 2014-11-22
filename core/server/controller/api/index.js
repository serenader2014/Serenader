var express = require('express'),
    apiRouter = express.Router();

require('./post')(apiRouter);
require('./category')(apiRouter);
require('./slug')(apiRouter);

module.exports = apiRouter;