(function () {
    angular.module('serenader',[
        'ngRoute',
        'ngResource',
        'appModule',
        ])
    .controller('appController', ['$scope',
        function ($scope) {
            $scope.url = url;
            $scope.assets = assets;
        }
    ])
    .controller('dashboardController', ['$scope', '$rootScope',
        function ($scope, $rootScope) {
            $rootScope.title = '控制面板';
        }
    ])
    .controller('postController', ['$scope', '$rootScope', '$location',
        function ($scope, $rootScope, $location){
            $rootScope.title = '文章';
            $scope.goToNewPost = function () {
                // console.log($location);
                $location.path(url.newPost);
            };
        }
    ])
    .controller('newPostController', ['$scope', '$rootScope', 'Category',
        function ($scope, $rootScope, cate) {
            $rootScope.title = '新文章';
            $scope.categories = cate.getAll();
            $scope.c = 'newone';
        }
    ])
    .controller('galleryController', ['$scope', '$rootScope',
        function ($rootScope) {

        }
    ])
    .controller('fileController', ['$scope', '$rootScope',
        function ($rootScope) {

        }
    ])
    .controller('settingController', ['$scope', '$rootScope',
        function ($rootScope) {

        }
    ])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: assets.server + '/views/dashboard.html',
            controller: 'dashboardController'
        })
        .when(url.post, {
            templateUrl: assets.server + '/views/post.html',
            controller: 'postController',
        })
        .when(url.gallery, {
            templateUrl: assets.server + '/views/gallery.html',
            controller: 'galleryController',
        })
        .when(url.file, {
            templateUrl: assets.server + '/views/file.html',
            controller: 'fileController',
        })
        .when(url.setting, {
            templateUrl: assets.server + '/views/settnig.html',
            controller: 'settingController',
        })
        .when(url.newPost, {
            templateUrl: assets.server + '/views/new_post.html',
            controller: 'newPostController'
        })
        .otherwise({
            redirectTo: '/'
        });
    }]);
})();