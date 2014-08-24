var path = require('path'),
    pkg = require('./package.json'),
    Setting = require('./proxy').setting;

var config = {
    name: 'Serenader',
    description: 'A blog created by serenader, with some interesting features',
    version: pkg.version,
    site_logo: '',
    site_icon: '',
    upload_dir: path.join(__dirname, 'upload'),
    db: 'mongodb://127.0.0.1/serenader',
    session_secret: 'cute cat',
    port: 80,
    allow_sign_up: true,
    root_dir: __dirname,
    admin_path: '/admin',
    dir: [
        '/data/private','/data/public/background','/data/tmp','/data/trash' 
    ]
};

module.exports.config = config;
