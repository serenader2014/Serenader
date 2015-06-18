var express       = require('express');
var adminHomePage = express.Router();
var url           = global.config.url;

adminHomePage.get('/', function (req, res) {
    res.render('dashboard');
});

adminHomePage.get(url.status, function (req, res) {
    if (global.initialized) {
        if (req.session.user) {
            res.json({ret: 0, data: {
                role: req.session.user.role,
                email: req.session.user.email,
                uid: req.session.user.uid,
                _id: req.session.user._id,
                website: req.session.user.website || '',
                avatar: url.api + '/' + url.avatar + '/' + req.session.user.uid,
                signature: req.session.user.signature || ''
            }});
        } else {
            res.json({ret: -1, error: 'Not logined.'});
        }
    } else {
        res.json({ret: 1, error: 'Blog haven\'t set up.'});
    }
});

require('./sign')(adminHomePage);

module.exports = adminHomePage;
