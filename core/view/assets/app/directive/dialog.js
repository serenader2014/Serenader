(function () {
    angular.module('appModule')
    .directive('dialogBox', function () {
        return {
            restrict: 'AE',
            templateUrl: assets.server + '/app/template/dialog.html',
            transclude: true,
            scope: {
                cancel: '&',
                confirm: '&',
                title: '@',
                outer: '='
            },
        };
    });
})();