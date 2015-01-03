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
            controller: ['$scope', '$rootScope', '$attrs', '$element',
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
