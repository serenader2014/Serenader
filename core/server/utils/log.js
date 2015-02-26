var chalk = require('chalk'),
    log = {};

log.info = function (str) {
    var start = '--------------- Logging info start ---------------\n\n',
        end = '\n\n--------------- Logging info end   ---------------';
    console.log(chalk.gray(start + str + end));
};
log.error = function (str) {
    var start = '--------------- Logging error start ---------------\n\n\n',
        end = '\n\n\n--------------- Logging error end   ---------------';
    console.log(chalk.bold.bgWhite.red(start + str + end));
};
log.success = function (str) {
    var start = '--------------- Logging success start ---------------\n\n',
        end = '\n\n--------------- Logging success end   ---------------';
    console.log(chalk.green(start + str + end));
};

module.exports = function () {
    return log;
};