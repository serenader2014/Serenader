(function () {
    angular.module('appModule')
    .directive('selector', function () {
        return {
            restrict: 'AE',
            templateUrl: assets.server + '/app/template/selector.html',
            transclude: true,
            require: 'ngModel',
            controller: ['$scope', '$attrs', function ($scope, $attrs) {
                $scope.options = [];
                $scope.isListShown = false;

                $scope.toggleList = function () {
                    $scope.isListShown = !$scope.isListShown;
                };

                this.addOption = function (option) {
                    if ($scope.options.length === 0 && !$scope.$eval($attrs.ngModel)) {
                        $scope.current = option.value;
                    }
                    $scope.options.push(option.value);
                };

                this.isSelected = function (option) {
                    return $scope.current === option.value;
                };

                this.select = function (option) {
                    $scope.current = option.value;
                    $scope.isListShown = false;
                };
            }],
            link: function ($scope, $elem, $attrs, ctrl) {
                $scope.$watch('current', function (value) {
                    if (value) {
                        ctrl.$setViewValue(value);
                    }
                });
                $scope.$watch($attrs.ngModel, function (value) {
                    $scope.current = value;
                });
                ctrl.$render = function () {
                    $scope.current = ctrl.$viewVlaue;
                };
            }
        };
    })
    .directive('selectorList', function () {
        return {
            require: '^selector',
            template: '<li ng-class="{selected: isSelected()}" ng-click="select()">{{value}}</li>',
            scope: {
                value: '@'
            },
            restrict: 'AE',
            link: function ($scope, $elem, $attrs, parentCtrl) {
                parentCtrl.addOption($scope);
                $scope.isSelected = function () {
                    return parentCtrl.isSelected(this);
                };
                $scope.select = function () {
                    parentCtrl.select(this);
                };
            }
        };
    });
})();