angular.module('serenader').factory('Post', ['$resource', function ($resource) {
    return $resource(url.api + url.post + '/:id', {}, {
        getAll: {method: 'GET', params: {id: ''}},
        new: {method: 'POST', params: {id: ''}},
        update: {method: 'PUT'},
        delete: {method: 'DELETE'},
        get: {method: 'GET'}
    });
}]).factory('Upload', ['FileUploader', function (FileUploader) {
    return function (options) {

        var uploader = new FileUploader(),
            emptyFunc = function () {};

        uploader.onAfterAddingFile      = options.addFile || emptyFunc;
        uploader.onWhenAddingFileFailed = options.addFailed || emptyFunc;
        uploader.onAfterAddingAll       = options.addAll || emptyFunc;
        uploader.onBeforeUploadItem     = options.beforeUpload || emptyFunc;
        uploader.onProgressItem         = options.progress || emptyFunc;
        uploader.onSuccessItem          = options.success || emptyFunc;
        uploader.onErrorItem            = options.error || emptyFunc;
        uploader.onCancelItem           = options.cancel || emptyFunc;
        uploader.onCompleteItem         = options.complete || emptyFunc;
        uploader.onProgressAll          = options.progressAll || emptyFunc;
        uploader.onCompleteAll          = options.completeAll || emptyFunc;
        uploader.url                    = options.url;

        return uploader;
    };

}]).factory('File', ['$http', function ($http) {
    return {
        getDir: function (dir, type) {
            return $http.post(url.api + url.fileList, {
                dir: dir,
                type: type
            });
        },
        newFile: function (options) {
            return $http.post(url.api + url.newFile, {
                dir: options.dir,
                name: options.name,
                type: options.type
            });
        },
        delete: function (file) {
            return $http.delete(url.api + url.upload + file);
        },
        getContent: function (path) {
            return $http.get(path);
        },
        saveEdit: function (content, dir) {
            return $http.put(url.api + url.fileEdit, {
                file: content,
                dir: dir
            });
        },
        move: function (src, dst) {
            return $http.post(url.api + url.fileMove, {
                file: src,
                target: dst
            });
        }
    };
}]).factory('Gallery', ['$resource', function ($resource) {
    return {
        common: $resource(url.api + url.gallery + '/:id', {}, {
            getAll: {method: 'GET', params: {id: ''}},
            new: {method: 'POST', params: {id: ''}},
            update: {method: 'PUT'},
            delete: {method: 'DELETE'},
            get: {method: 'GET'}
        }),
        user: $resource(url.api + url.user + '/:name' + url.gallery, {}, {
            get: {method: 'GET'}
        })
    };
}]).factory('deleteImg', ['$http', function ($http) {
    return function (id, slug) {
        return $http.delete(url.api + url.gallery + '/' + slug + '/' + id);
    };
}]).factory('User', ['$http', function ($http) {
    return function () {
        return $http.get(url.admin + url.status);
    };
}]).factory('Slug', ['$resource', function($resource){
    return $resource(url.api + url.slug, {}, {
        generate: {method: 'POST'}
    });
}]).factory('Category', ['$resource', function ($resource) {
    return $resource(url.api + url.category + '/:id', {},{
        getAll: {method: 'GET', params: {id: ''}},
        update: {method: 'PUT'},
        delete: {method: 'DELETE'},
        new: {method: 'POST', params: {id: ''}}
    });
}]).factory('postSignIn', ['$http', function ($http) {
    return function (username, password) {
        return $http.post(url.admin + url.signIn, {
            username: username,
            password: password
        });
    };
}]).factory('postSignUp', ['$http', function($http){
    return function (option){
        return $http.post(url.admin + url.signUp, {
            username: option.username,
            password: option.password,
            email: option.email,
            rePwd: option.rePwd
        });
    };
}]).factory('postSetup', ['$http', function ($http) {
    return function (option) {
        return $http.post(url.admin + url.setup, {
            username: option.username,
            password: option.password,
            email: option.email,
            title: option.title,
            description: option.description
        });
    };
}]).factory('userStatus', ['$rootScope', '$location', function($rootScope, $location){
    return function (){
        if ($rootScope.status === 1) {
            $location.path(url.setup);
            return false;
        } else if ($rootScope.status === -1) {
            $location.path(url.signIn);
            return false;
        }
        return true;
    };
}]);