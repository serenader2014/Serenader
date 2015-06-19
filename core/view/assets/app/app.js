var app = angular.module('serenader',[
    'ngRoute',
    'ngResource',
    'ngSanitize',
    'angularFileUpload'
]);

app.config(['$routeProvider', function ($routeProvider) {
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
    }).when(url.signIn, {
        templateUrl: assets.server + '/app/template/signin.html',
        controller: 'signinController'
    }).when(url.signUp, {
        templateUrl: assets.server + '/app/template/signup.html',
        controller: 'signupController'
    }).when(url.setup, {
        templateUrl: assets.server + '/app/template/setup.html',
        controller: 'setupController'
    }).otherwise({
        redirectTo: '/'
    });
}]);

app.controller('dashboardController', ['$scope', '$rootScope', 'userStatus', function($scope, $rootScope, userStatus){
    if (!userStatus()) {
        return false;
    }
    $rootScope.title = '控制台';

}]);

app.controller('appController', ['$scope', '$rootScope', '$compile', '$element', 'User', '$location',
    function ($scope, $rootScope, $compile, $element, user, $location) {
        $rootScope.title = '管理面板';
        $rootScope.msg = [];
        $rootScope.hideMsg = function () {
            var msg = this.msg.shift();
            if (msg.callback && typeof msg.callback === 'function') {
                msg.callback();
            }
        };
        $rootScope.addMsg = function (msg, callback) {
            this.msg.push({msg: msg, callback: callback});
        };
        $scope.url = url;
        $scope.assets = assets;
        $scope.isUserProfileShown = false;

        $rootScope.$watch('status', function (value) {
            $scope.notAllowed = value === 0 ? false : true;
        });

        $rootScope.$on('userChange', function () {
            user().then(function (response) {
                $rootScope.status = response.data.ret;
                switch (response.data.ret) {
                    case 0:
                        $rootScope.currentUser = response.data.data;
                        break;
                    case 1:
                        $location.path(url.setup);
                        break;
                    case -1:
                        $location.path(url.signIn);
                }
            });
        });

        $rootScope.$emit('userChange');


        if ($(window).width() < 720) {
            $rootScope.isMobile = true;
        }

        $scope.toggleUserProfile = function () {
            $scope.isUserProfileShown = !$scope.isUserProfileShown;
        };

        $scope.isSideMenuShown = false;

        $rootScope.loadingItem = [];

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

app.factory('httpInject', ['$rootScope', function($rootScope){
    return {
        request: function (request) {
            $rootScope.loadingItem.push(request.url);
            return request;
        },
        response: function (response) {
            $rootScope.loadingItem.splice($rootScope.loadingItem.indexOf(response.config.url), 1);
            return response;
        }
    };
}]);

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpInject');
}]);

app.filter('ellipsis', [function () {
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
}]);

$(function () {
    $('.loading-wrapper').fadeOut(function () {
        $('.panel').fadeIn();
        $('.msg-window').css({display: 'block'});
        $('.http-progress').css({display: 'block'});
    });
});