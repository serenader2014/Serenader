(function () {
    angular.module('appModule')
    .factory('Post', ['$resource', function ($resource) {
        return {
            common: $resource(url.api + url.post + '/:id', {}, {
                getAll: {method: 'GET', params: {id: ''}},
                new: {method: 'POST', params: {id: ''}},
                update: {method: 'PUT'},
                delete: {method: 'DELETE'},
                get: {method: 'GET'}
                }),
            user: $resource(url.api + url.user + '/:name' + url.post, {}, {
                get: {method: 'GET'}
            })
        };
    }])
    .factory('Upload', ['FileUploader', function (FileUploader) {
        return function (options) {

            var uploader = new FileUploader(),
                emptyFunc = function () {};

            uploader.onAfterAddingFile = options.addFile || emptyFunc;
            uploader.onWhenAddingFileFailed = options.addFailed || emptyFunc;
            uploader.onAfterAddingAll = options.addAll || emptyFunc;
            uploader.onBeforeUploadItem = options.beforeUpload || emptyFunc;
            uploader.onProgressItem = options.progress || emptyFunc;
            uploader.onSuccessItem = options.success || emptyFunc;
            uploader.onErrorItem = options.error || emptyFunc;
            uploader.onCancelItem = options.cancel || emptyFunc;
            uploader.onCompleteItem = options.complete || emptyFunc;
            uploader.onProgressAll = options.progressAll || emptyFunc;
            uploader.onCompleteAll = options.completeAll || emptyFunc;
            uploader.url = options.url;

            return uploader;
        };

    }])
    .factory('File', ['$http', function ($http) {
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
            }
        };
    }])
    .factory('Gallery', ['$resource', function ($resource) {
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
    }])
    .factory('deleteImg', ['$http', function ($http) {
        return function (id, slug) {
            return $http.delete(url.api + url.gallery + '/' + slug + '/' + id);
        };
    }])
    .factory('User', ['$resource', function ($resource) {
        return $resource(url.api + url.currentUser, {}, {
            current: {method: 'GET'}
        });
    }])
    .factory('Slug', ['$resource', function($resource){
        return $resource(url.api + url.slug, {}, {
            generate: {method: 'POST'}
        });
    }])
    .factory('Category', ['$resource', function ($resource) {
        return $resource(url.api + url.category + '/:id', {},{
            getAll: {method: 'GET', params: {id: ''}},
            update: {method: 'PUT'},
            delete: {method: 'DELETE'},
            new: {method: 'POST', params: {id: ''}}
        });
    }]);
})();