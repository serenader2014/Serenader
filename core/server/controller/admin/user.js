var auth_user = require('../../utils/auth_user'),
    User = require('../../models').User,
    url = require('../../../../config').config.url;

module.exports = function (router) {
    router.get(url.adminUser + '/:user', auth_user, function (req, res, next) {
        var user = req.params.user;
        res.render('admin_user', {user: user});
    });

    router.post(url.adminUser + '/:user', auth_user, function (req, res, next) {
        var user = req.params.user,
            email = req.body.email,
            pwd = req.body.pwd,
            website = req.body.website,
            header = req.body.header,
            role = req.body.role,
            signature = req.body.signature;
        User.updateUserProfile(user, email, pwd, website, header, role, signature, function (err,n ,r) {
            if (err) res.send(err);
            res.redirect('/u/'+user);
        });
    });
};