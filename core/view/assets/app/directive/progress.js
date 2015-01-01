angular.module('appModule')
.directive('pgress', function () {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: assets.server + '/app/template/progress.html',
        link: function ($scope, $elem) {
            $scope.close = function () {
                $elem.remove();
            };
        }
    };
});