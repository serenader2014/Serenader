angular.module('appModule')
.directive('msgBox', function () {
    return {
        restrict: 'AE',
        transclude: true,
        scope: {
            callback: '&'
        },
        templateUrl: assets.server + '/app/template/msg-box.html',
        link: function ($scope, $elem, $attrs) {
            if (!$attrs.callback) {
                $scope.callback = function () {
                    $scope.closed = true;
                };
            }
        }
    };
});