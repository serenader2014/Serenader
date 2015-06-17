angular.module('serenader').directive('selector', function () {
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
                    $scope.current = {value: option.value, name: option.name};
                }
                $scope.options.push({value: option.value, name: option.name});
            };

            this.isSelected = function (option) {
                return $scope.current.value === option.value;
            };

            this.select = function (option) {
                $scope.current = {value: option.value, name: option.name};
                $scope.isListShown = false;
            };
        }],
        link: function ($scope, $elem, $attrs, ctrl) {
            $scope.$watch('current.value', function (value) {
                if (value) {
                    ctrl.$setViewValue(value);
                }
            });
            $scope.$watch($attrs.ngModel, function (value) {
                $scope.current.value = value;
            });
            ctrl.$render = function () {
                $scope.current = {value: '', name: ''};
                $scope.current.value = ctrl.$viewVlaue;
            };
        }
    };
}).directive('selectorList', function () {
    return {
        require: '^selector',
        template: '<li ng-class="{selected: isSelected()}" ng-click="select()">{{name || value}}</li>',
        scope: {
            value: '@',
            name: '@'
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
