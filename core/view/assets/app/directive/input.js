(function () {
    var alphanumericRegExp = /^[a-zA-Z0-9]+$/i,
        alphaRegExp = /^[a-zA-Z]+$/i,
        numericRegExp = /^-?[0-9]+$/i,
        emailRegExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

    angular.module('serenader').directive('mdInput', function () {
        return {
            restrict: 'AE',
            templateUrl: assets.server + '/app/template/input.html',
            scope: {
                name: '@',
                type: '@',
                title: '@',
                desc: '@',
                rePwd: '@',
                value: '=',
                updateOn: '@',
            },
            transclude: true,
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ctrl) {
                var input = $element.find('input');
                $scope.$watch(function () {
                    return ctrl.$modelValue;
                }, function (value) {
                    if (value) {
                        // input.val(value);
                    }
                });
                $scope.hasDesc = $attrs.desc;
                $scope.isFocus = false;

                input.on('keyup', function () {
                    if ($scope.updateOn === 'default' || $scope.updateOn !== 'blur') {
                        $scope.$apply(function () {
                            ctrl.$setViewValue(input.val());
                        });
                    }
                }).on('blur', function () {
                    if ($scope.updateOn === 'blur') {
                        $scope.$apply(function () {
                            ctrl.$setViewValue(input.val());
                        });
                    }
                });

                $scope.hasValue = function () {
                    return ctrl.$viewValue;
                };

                $scope.isError = function () {
                    return ctrl.$invalid;
                };

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
            }
        };
    });

})();
