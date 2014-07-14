var express = require('express');

var controlPanel = express.Router();

controlPanel.get('/',function (req, res, next) {
    req.session.cookie.maxAge = 1000*60*20;
    if (req.session.view) {
        req.session.view++;
    } else {
        req.session.view = 1;
    }
    console.log(req.session);
    res.render('admin');
});



function route (app, req, res, next) {
    app.get('/a', function (req, res) {
        res.send(200);
    });

    app.use('/admin', controlPanel);
}

module.exports = route;