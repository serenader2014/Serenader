var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    auth_user = require('../../utils/auth_user'),
    log = require('../../utils/log')(),
    errorHandling = require('../../utils/error'),
    config = require('../../../../config').config;

module.exports = function (router) {
    router.get(config.url.setting, auth_user, function (req, res) {
        if (req.session.user.role !== 'admin') {
            res.redirect(config.url.admin);
            return false;
        }
        fs.readdirAsync(config.root_dir + '/content/themes').then(function (files) {
            var themes = [];
            return files.reduce(function (p, item) {
                return p.then(function () {
                    return fs.statAsync(config.root_dir + '/content/themes/' + item).then(function (stat) {
                        if (stat.isDirectory()) {
                            var pkg = config.root_dir + '/content/themes/' + item + '/package.json';
                            return fs.readJsonAsync(pkg).then(function (theme) {
                                if (theme.name && theme.version) {
                                    return themes.push(theme);
                                }
                            });
                        }
                    });
                }).catch(function (err) {
                    log.error(err.stack);
                });
            }, Promise.resolve()).then(function (theme) {
                res.render('setting', { themes: theme });
            });
        }).catch(function (err) {
            errorHandling(req, res, { error: err.message, type: 500 });
        });
    });
};