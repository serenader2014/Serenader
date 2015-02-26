var pkg = require('./package.json'),
    config = {
        version: pkg.version,
        db: 'mongodb://127.0.0.1/serenader',
        session_secret: 'cute cat',
        port: 10086,
        root_dir: __dirname,
        url: {
            api: '/api',
            avatar: '/avatar',
            admin: '/admin',
            slug: '/slug',
            post: '/post',
            currentUser: '/user/current',
            newPost: '/post/new',
            postUpload: '/public/post_attachment',
            category: '/category',
            newCategory: '/category/new',
            gallery: '/gallery',
            newGallery: '/gallery/new',
            galleryUpload: '/gallery/upload',
            galleryCoverUpload: '/gallery/upload/cover',
            file: '/files',
            publicFile: '/files/public',
            privateFile: '/files/private',
            newFile: '/files/new',
            fileEdit: '/files/edit',
            fileMove: '/files/move',
            fileCopy: '/files/copy',
            filePreview: '/files/preview',
            fileList: '/files/list',
            upload: '/upload',
            setting: '/setting',
            user: '/u',
            sign: '/sign',
            signIn: '/signin',
            signUp: '/signup',
            signOut: '/signout',
            blog: '/blog',
            about: '/about',
        },
        assetsUrl: {
            clientSideAssets: '/client',
            serverSideAssets: '/server',
            staticFile: '/static'
        },
        blogConfig: {
            name: 'Serenader',
            desc: 'A blog created by serenader, with some interesting features',
            logo: '/static/logo.png',
            favicon: '/static/favicon.ico',
            allowSignUp: true,
            theme: 'blue',
            postsPerPage: 10
        },
        dir: [
            '/content/data/private',
            '/content/data/public/background',
            '/content/data/tmp',
            '/content/data/trash'
        ],
        api: {
            amountPerRequest: 100
        }
    };

module.exports.config = config;
