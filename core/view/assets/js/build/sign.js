(function () {
    angular.module('serenader', [
        'ngRoute',
        'ngAnimate',
        'appModule'
    ])
    .controller('signController', ['$rootScope', function ($rootScope) {
        $rootScope.sign = {};
    }])
    .controller('signInController', ['$scope', '$rootScope', 'postSignIn', '$window',
        function ($scope, $rootScope, sign, $window) {
            var globalSignIn = $rootScope.sign.signIn = {};

            $scope.redirect = function () {
                var finalObj = {};
                if ($window.location.search) {
                    var raw = $window.location.search,
                        rawArr = raw.split('?')[1].split('&');

                    angular.forEach(rawArr, function (item) {
                        var tmpArr = item.split('=');
                        finalObj[tmpArr[0]] = tmpArr[1];
                    });

                }
                window.location = finalObj.url || url.admin;
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
    ])
    .controller('signUpController', ['$scope', '$rootScope', 'postSignUp',
        function ($scope, $rootScope, sign) {
            var globalSignUp = $rootScope.sign.signUp = {};

            $scope.redirect = function () {
                window.location.hash = '#/signin';
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
    ])
    .config(['$routeProvider', function ($routeProvider) {
        console.log($routeProvider);
        $routeProvider
        .when('/signin', {
            templateUrl: assets.server + '/views/signin.html',
            controller: 'signInController'
        })
        .when('/signup', {
            templateUrl: assets.server + '/views/signup.html',
            controller: 'signUpController'
        })
        .otherwise({
            redirectTo: '/signin'
        });
    }]);
})();

(function () {
    angular.module('appModule', [


    ]);
})();

(function () {
    var alphanumericRegExp = /^[a-zA-Z0-9]+$/i,
        alphaRegExp = /^[a-zA-Z]+$/i,
        numericRegExp = /^-?[0-9]+$/i,
        emailRegExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

    angular.module('appModule')
    .directive('mdInput', function () {
        return {
            restrict: 'AE',
            templateUrl: assets.server + '/app/template/input.html',
            scope: {
                name: '@',
                type: '@',
                title: '@',
                desc: '@',
                rePwd: '@'
            },
            transclude: true,
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ctrl) {
                var input = $element.find('input');

                input.val($attrs.value);
                $scope.hasDesc = $attrs.desc;
                $scope.isFocus = false;

                $scope.hasValue = function () {
                    return input.val();
                };

                $scope.isError = function () {
                    return ctrl.$invalid;
                };

                input.on('focus', function () {
                    $scope.isFocus = true;
                    $scope.$apply();
                }).on('blur', function () {
                    $scope.isFocus = false;
                    $scope.$apply();
                    $scope.$apply(function () {
                        ctrl.$setViewValue(input.val());
                    });
                }).on('keyup', function () {
                    $scope.$apply(function () {
                        ctrl.$setViewValue(input.val());
                    });
                });

                ctrl.$validators.min = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;

                    if (!$attrs.min || !value) {
                        return true;
                    }

                    return Number(value) >= Number($attrs.min);
                };

                ctrl.$validators.max = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;

                    if (!$attrs.max || !value) {
                        return true;
                    }

                    return Number(value) <= Number($attrs.max);
                };

                ctrl.$validators.minLength = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;

                    if (!$attrs.minLength || !value) {
                        return true;
                    }

                    return value.length >= Number($attrs.minLength);
                };

                ctrl.$validators.maxLength = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;

                    if (!$attrs.maxLength || !value) {
                        return true;
                    }

                    return value.length <= Number($attrs.maxLength);
                };

                ctrl.$validators.alphanumeric = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;

                    if (!$attrs.alphanumeric || !value) {
                        return true;
                    }

                    return alphanumericRegExp.test(value);
                };

                ctrl.$validators.alpha = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;

                    if (!$attrs.alpha || !value) {
                        return true;
                    }

                    return alphaRegExp.test(value);
                };

                ctrl.$validators.numeric = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;

                    if (!$attrs.numeric || !value) {
                        return true;
                    }

                    return numericRegExp.test(value);
                };

                ctrl.$validators.email = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;

                    if ($attrs.type !== 'email' || !value) {
                        return true;
                    }

                    return emailRegExp.test(value);
                };

                ctrl.$validators.rePwd = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;

                    if (!$attrs.rePwd) {
                        return true;
                    }

                    return value === $attrs.rePwd;
                };

                ctrl.$render = function () {
                    input.val(ctrl.$viewVlaue);
                };

                ctrl.$setViewValue(input.val());
            }
        };
    });

})();

(function () {
    angular.module('appModule')
    .directive('pgress', function () {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: assets.server + '/app/template/progress.html',
            controller: ['$scope', '$rootScope', '$attrs',
                function ($scope, $rootScope, $attrs) {
                    $scope.close = function () {
                        var _var = $attrs.ngShow,
                            target = $rootScope,
                            lastKey;
                        if (_var.indexOf('.') !== -1) {
                            var arr = _var.split('.');
                            lastKey = arr.splice(arr.length - 1, 1)[0];
                            angular.forEach(arr, function (a) {
                                target = target[a];
                            });
                        } else {
                            lastKey = $attrs.ngShow;
                        }
                        var tmp = !!target[lastKey];
                        target[lastKey] = !tmp;
                    };
                }
            ]
        };
    });
})();

(function () {
    angular.module('appModule')
    .directive('msgBox', function () {
        return {
            restrict: 'AE',
            transclude: true,
            scope: {
                callback: '&',
                type: '@'
            },
            templateUrl: assets.server + '/app/template/msg-box.html',
            controller: ['$scope', '$rootScope', '$attrs',
                function ($scope, $rootScope, $attrs) {
                    if (!$attrs.callback) {
                        $scope.callback = function () {
                            var _var = $attrs.ngShow,
                                target = $rootScope,
                                lastKey;
                            if (_var.indexOf('.') !== -1) {
                                var arr = _var.split('.');
                                lastKey = arr.splice(arr.length - 1, 1);
                                angular.forEach(arr, function (a) {
                                    target = target[a];
                                });
                            } else {
                                lastKey = $attrs.ngShow;
                            }

                            var tmp = !!target[lastKey];

                            target[lastKey] = !tmp;
                        };
                    }
                }
            ]
        };
    });
})();

angular.module('appModule')
.factory('postSignIn', ['$http', function ($http) {
    return function (username, password) {
        return $http.post(url.admin + url.signIn, {
            username: username,
            password: password
        });
    };
}])
.factory('postSignUp', ['$http', function($http){
    return function (option){
        return $http.post(url.admin + url.signUp, {
            username: option.username,
            password: option.password,
            email: option.email,
            rePwd: option.rePwd
        });
    };
}]);