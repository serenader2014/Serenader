angular.module('serenader').controller('setupController', ['$scope', '$rootScope', '$location', 'postSetup', function($scope, $rootScope, $location, setup){
    $rootScope.title = '设置博客';
    $scope.setupBlog = function () {
        if (!$scope.blogName || !$scope.blogDesc || !$scope.username || !$scope.password || !$scope.email) {
            $rootScope.addMsg('请完善博客信息。');
            return false;
        }
        setup({
            title: $scope.blogName,
            description: $scope.blogDesc,
            username: $scope.username,
            password: $scope.password,
            email: $scope.email
        }).success(function (response) {
            if (response.ret === 0) {
                $rootScope.status = 0 ;
                $location.path('/');
            } else {
                $rootScope.msg.push(response.error);
            }
        });
    };
}]);