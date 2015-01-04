(function () {
    angular.module('serenader',[
        'ngRoute',
        'ngResource',
        'appModule',
        'angularFileUpload'
        ])
    .controller('appController', ['$scope',
        function ($scope) {
            $scope.url = url;
            $scope.assets = assets;
            $scope.isUserProfileShown = false;

            $scope.toggleUserProfile = function () {
                $scope.isUserProfileShown = !$scope.isUserProfileShown;
            };


            $scope.isSideMenuShown = false;

            $scope.toggleSideMenu = function () {
                if ($(window).width() > 720) {
                    return false;
                }
                $scope.isSideMenuShown = !$scope.isSideMenuShown;
            };

            $(window).on('click', function (event) {
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
                $location.path(url.newPost);
            };
        }
    ])
    .controller('newPostController', ['$scope', '$rootScope', 'Category', 'FileUploader',
        function ($scope, $rootScope, cate, FileUploader) {
            var uploader = $scope.uploader = new FileUploader({
                url: url.api + url.upload + url.postUpload
            });
            $rootScope.title = '新文章';
            $scope.categories = cate.getAll();
            $scope.post = {};
            $scope.isUrlTabShown = true;
            $scope.isUploadTabShown = !$scope.isUrlTabShown;

            $scope.insert = function () {
                $scope.showInsertImg = false;
                var editor = $('.editor'),
                    value = $scope.post.content || '',
                    start = editor.get(0).selectionStart,
                    end = editor.get(0).selectionEnd,
                    str = '![image](' + ($scope.imgUrl || '') + ')';
                $scope.post.content = value.substring(0, start) + str + value.substring(end);
                editor.focus();
                editor.get(0).selectionStart = start + 2;
                editor.get(0).selectionEnd = start + 7;
            };

            $scope.switchTab = function (tab) {
                if (tab === 'url') {
                    $scope.isUrlTabShown = true;
                    $scope.isUploadTabShown = !$scope.isUrlTabShown;
                } else {
                    $scope.isUrlTabShown = false;
                    $scope.isUploadTabShown = !$scope.isUrlTabShown;
                }
            };

            uploader.onAfterAddingFile = function (item) {
                item.onComplete = function (response, status) {
                    if (status === 200) {
                        $scope.imgUrl = response[0].url;
                    }
                };
                $scope.isAdded = true;
            };

            uploader.onProgressAll = function () {
                $scope.isUploading = true;
            };

            uploader.onCompleteAll = function () {
                $scope.isFinished = true;
            };

            uploader.onCancelItem = function () {
                $scope.isUploading = false;
            };

            uploader.onErrorItem = function (item, response, status) {
                $scope.isFinished = true;
                $scope.isError = true;
                $scope.errorItem = {
                    item: item,
                    code: status
                };
            };

            $scope.reSelect = function (item) {
                if (item.isUploading) {
                    item.cancel();
                }
                uploader.clearQueue();
                $('#file-input').val('');
                $scope.isAdded = $scope.isUploading = $scope.isFinished = false;
            };
        }
    ])
    .controller('insertImgController', ['$scope',
        function ($scope) {
            $scope.$watch('imgUrl', function (value) {
                $scope.$parent.$parent.imgUrl = value;
            });
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
            templateUrl: assets.server + '/views/post_list.html',
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
            templateUrl: assets.server + '/views/post.html',
            controller: 'newPostController'
        })
        .otherwise({
            redirectTo: '/'
        });
    }]);
})();