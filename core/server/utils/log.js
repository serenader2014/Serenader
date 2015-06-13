var chalk = require('chalk'),
    log = {};

log.info = function (str) {
    var start = 'Info    -->  ';
    console.log(chalk.gray(start) + str);
};
log.error = function (str) {
    var start = 'Error   -->  ';
    console.log(chalk.bold.bgWhite.red(start) + str);
};
log.success = function (str) {
    var start = 'Success -->  ';
    console.log(chalk.green(start) + str);
};

module.exports = function () {
    return log;
};