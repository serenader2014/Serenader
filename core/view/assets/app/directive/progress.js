angular.module('serenader').directive('pgress', function () {
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
