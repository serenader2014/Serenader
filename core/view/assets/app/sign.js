(function () {
    var app = angular.module('serenader', ['ngRoute','ngAnimate','appModule']);

    app.controller('signinController', ['$scope', '$rootScope', 'postSignIn', '$window',
        function ($scope, $rootScope, sign) {
            var globalSignIn = $rootScope.sign.signIn;

            $rootScope.title = '登录 - Serenader';
            $scope.redirect = function () {
                window.location = url.admin;
            };

            $scope.signIn = function () {
                if (!$scope.username || !$scope.password) {
                    alert('请完善表单内容！');
                    return false;
                }
                globalSignIn.pending = true;

                sign($scope.username, $scope.password).success(function (result) {
                    globalSignIn.pending = false;
                    if (result.ret === 0) {
                        globalSignIn.success = true;
                    } else {
                        globalSignIn.error = true;
                        globalSignIn.message = result.error;
                        globalSignIn.success = false;
                    }
                }).error(function () {
                    globalSignIn.success = false;
                    globalSignIn.pending = false;
                    globalSignIn.error = true;
                    globalSignIn.message = '网络错误，请求失败！';
                });
            };
        }
    ]);

    app.controller('signupController', ['$scope', '$rootScope', 'postSignUp',
        function ($scope, $rootScope, sign) {
            var globalSignUp = $rootScope.sign.signUp;

            $rootScope.title = '注册帐号 - Serenader';
            $scope.redirect = function () {
                window.location = url.admin;
            };

            $scope.signUp = function () {
                if (!$scope.username ||
                    !$scope.email ||
                    !$scope.password ||
                    !$scope.repwd) {
                    alert('请完善表单内容！');
                    return false;
                }
                globalSignUp.pending = true;

                sign({
                    username: $scope.username,
                    email: $scope.email,
                    password: $scope.password,
                    rePwd: $scope.repwd
                }).success(function (result) {
                    globalSignUp.pending = false;
                    if (result.ret === 0) {
                        globalSignUp.success = true;
                    } else {
                        globalSignUp.success = false;
                        globalSignUp.error = true;
                        globalSignUp.message = result.error;
                    }
                }).error(function () {
                    globalSignUp.pending = false;
                    globalSignUp.success = false;
                    globalSignUp.error = true;
                    globalSignUp.message = '网络错误，请求失败！';
                });
            };
        }
    ]);
})();
