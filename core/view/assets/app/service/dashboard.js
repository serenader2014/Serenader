(function () {
    angular.module('appModule')
    .factory('Post', ['$resource', function ($resource) {
        return {
            common: $resource(url.api + url.post + '/:id', {}, {
                getAll: {method: 'GET', params: {id: ''}, isArray: true},
                new: {method: 'POST', params: {id: ''}},
                update: {method: 'PUT'},
                delete: {method: 'DELETE'},
                get: {method: 'GET'}
                }),
            user: $resource(url.api + url.user + '/:user' + url.post, {}, {
                get: {method: 'GET', isArray: true}
            })
        };


    }])
    .factory('Slug', ['$resource', function($resource){
        return $resource(url.api + url.slug, {}, {
            generate: {method: 'POST'}
        });
    }])
    .factory('Category', ['$resource', function ($resource) {
        return $resource(url.api + url.category + '/:id', {},{
            getAll: {method: 'GET', params: {id: ''}, isArray: true}
        });
    }]);
})();