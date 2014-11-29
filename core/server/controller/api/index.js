var express = require('express'),
    apiRouter = express.Router();

require('./post')(apiRouter);
require('./category')(apiRouter);
require('./slug')(apiRouter);
require('./gallery')(apiRouter);
require('./upload')(apiRouter);
require('./file')(apiRouter);
require('./setting')(apiRouter);
require('./avatar')(apiRouter);

module.exports = apiRouter;