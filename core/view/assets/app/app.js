(function () {
    var loadingItem = [];
    angular.module('serenader',[
        'ngRoute',
        'ngResource',
        'ngSanitize',
        'angularFileUpload'
    ]).config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push(function () {
            var obj = {
                request: function (request) {
                    loadingItem.push(request.url);
                    return request;
                },
                response: function (response) {
                    loadingItem.splice(loadingItem.indexOf(response.config.url), 1);
                    return response;
                }
            };
            return obj;
        });
    }]).config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: assets.server + '/app/template/dashboard.html',
            controller: 'dashboardController'
        }).when(url.post, {
            templateUrl: assets.server + '/app/template/post_list.html',
            controller: 'postController',
        }).when(url.gallery, {
            templateUrl: assets.server + '/app/template/gallery.html',
            controller: 'galleryController',
        }).when(url.gallery + '/:id', {
            templateUrl: assets.server + '/app/template/album.html',
            controller: 'albumController'
        }).when(url.file, {
            templateUrl: assets.server + '/app/template/file.html',
            controller: 'fileController',
        }).when(url.filePreview, {
            templateUrl: assets.server + '/app/template/preview.html',
            controller: 'previewController'
        }).when(url.setting, {
            templateUrl: assets.server + '/app/template/setting.html',
            controller: 'settingController',
        }).when(url.newPost, {
            templateUrl: assets.server + '/app/template/post.html',
            controller: 'newPostController'
        }).when(url.post + '/:id', {
            templateUrl: assets.server + '/app/template/post.html',
            controller: 'editPostController'
        }).when(url.signin, {
            templateUrl: assets.server + '/app/template/signin.html',
            controller: 'signinController'
        }).when(url.signup, {
            templateUrl: assets.server + '/app/template/signup.html',
            controller: 'signupController'
        }).when(url.setup, {
            templateUrl: assets.server + '/app/template/setup.html',
            controller: 'setupController'
        }).otherwise({
            redirectTo: '/'
        });
    }]).filter('ellipsis', [function () {
        return function (text, length) {
            if (!text) {
                return text;
            }
            if (text.length < length) {
                return text;
            } else {
                return text.substring(0, length) + '...';
            }
        };
    }]).controller('appController', ['$scope', '$rootScope', 'User', '$location',
        function ($scope, $rootScope, User, $location) {
            $scope.url = url;
            $scope.assets = assets;
            $scope.isUserProfileShown = false;
            User.then(function (response) {
                switch (response.data.ret) {
                    case 0:
                        $rootScope.user = response.data;
                        break;
                    case 1:
                        $location.path(url.setup);
                        break;
                    case -1:
                        $location.path(url.signin);
                }
                if (response.ret === 0) {
                    $rootScope.user = response.data;
                } else {
                    $rootScope.notLogin = true;
                }
            });
            $rootScope.redirectToLogin = function () {
                window.location(url.admin + url.sign);
            };
            if ($(window).width() < 720) {
                $rootScope.isMobile = true;
            }

            $scope.toggleUserProfile = function () {
                $scope.isUserProfileShown = !$scope.isUserProfileShown;
            };


            $scope.isSideMenuShown = false;

            $scope.loadingItem = loadingItem;

            $scope.toggleSideMenu = function () {
                if ($(window).width() > 720) {
                    return false;
                }
                $scope.isSideMenuShown = !$scope.isSideMenuShown;
            };

            $(window).on('click touchstart', function (event) {
                var target = event.target;

                if ($(target).parents('.sub-menu').length === 0 &&
                    $(target).parents('.user-avatar').length === 0) {
                    $scope.isUserProfileShown = false;
                }

                if ($(target).parents('.side-menu').length === 0 &&
                    $(target).parents('.side-menu-btn').length === 0) {
                    $scope.isSideMenuShown = false;
                }
                $scope.$digest();
            });
        }
    ]);
})();
