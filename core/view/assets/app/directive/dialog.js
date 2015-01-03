(function () {
    angular.module('appModule')
    .directive('dialogBox', function () {
        return {
            restrict: 'AE',
            templateUrl: assets.server + '/app/template/dialog.html',
            transclude: true,
            scope: {
                cancel: '&',
                confirm: '&'
            },
            link: function ($scope, $elem, $attr) {
                $scope.title = $attr.title;
            }
        };
    });
})();