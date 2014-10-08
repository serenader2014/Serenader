var chalk = require('chalk'),
    log = {};

log.info = function (str) {
    console.log(chalk.gray(str));
};
log.error = function (str) {
    console.log(chalk.bold.bgWhite.red(str));
};
log.success = function (str) {
    console.log(chalk.green(str));
};

module.exports = function () {
    return log;
};