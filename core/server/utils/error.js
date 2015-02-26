var log = require('./log')();

module.exports = function (req, res, options) {
    options = options ? options : {error: 'Null', type: 500};
    options.error = options.error ? options.error : 'Null';
    options.type = options.type ? options.type : 500;
    log.error(options.source + ': ' + options.error);
    res.status(options.type).render('error', {error: options.error, type: options.type, referer: req.headers.referer});
    return false;
};