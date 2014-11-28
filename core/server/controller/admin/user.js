var auth_user = require('../../utils/auth_user'),
    User = require('../../models').User,
    url = require('../../../../config').config.url;

module.exports = function (router) {
    router.get(url.user + '/:user', auth_user, function (req, res) {
        var user = req.params.user;
        res.render('admin_user', {user: user});
    });

    router.post(url.user + '/:user', auth_user, function (req, res) {
        var user = req.params.user,
            email = req.body.email,
            pwd = req.body.pwd,
            website = req.body.website,
            header = req.body.header,
            role = req.body.role,
            signature = req.body.signature;
        User.update({
            uid: user,
            email: email,
            pwd: pwd,
            website: website,
            profile_header: header,
            signature: signature,
            role: role
        }).then(function () {
            res.json({ret: 0});
        }).catch(function (err) {
            res.json({ret: -1, error: err.message});
        });
    });
};