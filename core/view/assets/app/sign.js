(function () {
    var app = angular.module('serenader');

    app.controller('signinController', ['$scope', '$rootScope', '$location', 'postSignIn', 'userStatus',
        function ($scope, $rootScope, $location, sign, userStatus) {
            if (userStatus()) {
                $location.path('/');
                return false;
            }

            $rootScope.title = '登录';
            $scope.signIn = function () {
                if (!$scope.username || !$scope.password) {
                    $rootScope.addMsg('请完善表单内容！');
                    return false;
                }

                sign($scope.username, $scope.password).success(function (result) {
                    if (result.ret === 0) {
                        $rootScope.addMsg('登陆成功，点击确定进入控制面板。', function () {
                            $rootScope.$emit('userChange');
                            $location.path('/');
                        });
                    } else {
                        $rootScope.addMsg(result.error);
                    }
                }).error(function () {
                    $rootScope.addMsg('网络错误，请求失败！');
                });
            };
        }
    ]);

    app.controller('signupController', ['$scope', '$rootScope', '$location', 'postSignUp', 'userStatus',
        function ($scope, $rootScope, $location, sign, userStatus) {
            if (userStatus()) {
                $location.path('/');
                return false;
            }
            $rootScope.title = '注册';
            $scope.signUp = function () {
                if (!$scope.username ||
                    !$scope.email ||
                    !$scope.password ||
                    !$scope.repwd) {
                    $rootScope.addMsg('请完善表单内容！');
                    return false;
                }
                sign({
                    username: $scope.username,
                    email: $scope.email,
                    password: $scope.password,
                    rePwd: $scope.repwd
                }).success(function (result) {
                    if (result.ret === 0) {
                        $rootScope.addMsg('注册成功！点击确定进入控制面板。', function () {
                            $rootScope.$emit('userChange');
                            $location.path('/');
                        });
                    } else {
                        $rootScope.addMsg(result.error);
                    }
                }).error(function () {
                    $rootScope.addMsg('网络错误，请求失败！');
                });
            };
        }
    ]);
})();
