(function () {
    angular.module('serenader').directive('msgBox', function () {
        return {
            restrict: 'AE',
            transclude: true,
            scope: {
                callback: '&',
                type: '@'
            },
            templateUrl: assets.server + '/app/template/msg-box.html',
            controller: ['$scope', '$rootScope', '$attrs', '$element',
                function ($scope, $rootScope, $attrs, $element) {
                    if (!$attrs.callback) {
                        $scope.callback = function () {
                            $element.remove();
                        };
                    }
                }
            ]
        };
    });
})();
