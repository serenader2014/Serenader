(function () {
    angular.module('appModule')
    .factory('Post', [function () {

    }])
    .factory('Category', ['$resource', function ($resource) {
        return $resource(url.api + url.category + '/:id', {},{
            getAll: {method: 'GET', params: {id: ''}, isArray: true}
        });
    }]);
})();