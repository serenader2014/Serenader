var path = require('path'),
    pkg = require('./package.json'),
    config = {
        version: pkg.version,
        upload_dir: path.join(__dirname, 'upload'),
        db: 'mongodb://127.0.0.1/serenader',
        session_secret: 'cute cat',
        port: 80,
        root_dir: __dirname,
        admin_path: '/admin',
        url: {
            admin: '/admin',
            adminPost: '/post',
            adminPostUpload: '/post/upload',
            adminNewPost: '/post/new',
            adminEditPost: '/post/edit',
            adminDeletePost: '/post/delete',
            adminNewCategory: '/category/new',
            adminEditCategory: '/category/edit',
            adminDeleteCategory: '/category/delete',
            adminGallery: '/gallery',
            adminNewGallery: '/gallery/new',
            adminGalleryUpload: '/gallery/upload',
            adminFile: '/files',
            adminPublicFile: '/files/public',
            adminPrivateFile: '/files/private',
            adminFileRename: '/files/rename',
            adminFileEdit: '/files/edit',
            adminFileDelete: '/files/delete',
            adminFileZip: '/files/zip/unzip',
            adminFilePreview: '/files/zip/preview',
            adminUpload: '/upload',
            adminSetting: '/setting',
            adminUser: '/u',
            adminSignIn: '/signin',
            adminSignUp: '/signup',
            adminSignOut: '/signout',
            indexPost: '/blog',
            indexCategory: '/blog?category=',
            indexTag: '/blog?tag=',
            indexGallery: '/gallery',
            indexAbout: '/about',
            indexUser: '/u',
        },
        blogConfig: {
            name: 'Serenader',
            desc: 'A blog created by serenader, with some interesting features',
            logo: '/static/logo.png',
            favicon: '/static/favicon.ico',
            allow_sign_up: true,
            theme: 'serenader',
            posts_per_page: 10
        },
        dir: [
            '/content/data/private',
            '/content/data/public',
            '/content/data/public/background',
            '/content/data/tmp',
            '/content/data/trash',
            '/content/images'
        ]
    };

module.exports.config = config;