var path = require('path'),
    pkg = require('./package.json');

var config = {
    name: 'Serenader',
    description: 'A blog created by serenader, with some interesting features',
    version: pkg.version,
    site_logo: '',
    site_icon: '',
    site_nav: [
        {name: 'home', value: '/'},
        {name: 'blog', value: '/blog'},
        {name: 'picture', value: '/picture'},
        {name: 'about', value: '/about'}
    ],
    upload_dir: path.join(__dirname, 'upload'),
    db: 'mongodb://127.0.0.1/sernblog',
    session_secret: 'cute cat',
    port: 80,
    allow_sign_up: true,
    root_dir: __dirname,
    admin_path: '/admin'
};

module.exports = config;