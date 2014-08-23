var path = require('path'),
    pkg = require('./package.json'),
    Setting = require('./proxy').setting;

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
    db: 'mongodb://f385c013-f1a7-4adb-944c-00fa23e58ddd:2648e6c8-e34e-470d-a96a-b8436faa8a82@10.9.29.172:10019/db',
    session_secret: 'cute cat',
    port: 80,
    allow_sign_up: true,
    root_dir: __dirname,
    admin_path: '/admin'
};

module.exports.config = config;
