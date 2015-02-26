var config = require('../../../../config').config,
    url = config.url;


module.exports = function (router) {
    router.get(url.currentUser, function (req, res) {
        if (req.session.user) {
            res.json({
                ret: 0,
                data: {
                    uid: req.session.user.uid,
                    email: req.session.user.email,
                    website: req.session.user.website,
                    avatar: url.avatar + '/' + req.session.user.uid,
                    role: req.session.user.role,
                    signature: req.session.user.signature,
                    id: req.session.user._id
                }
            });
        } else {
            res.json({ret: -1, error: '请登录。'});
        }
    });
};