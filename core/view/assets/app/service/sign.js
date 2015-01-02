angular.module('appModule')
.factory('postSignIn', ['$http', function ($http) {
    return function (username, password) {
        return $http.post(url.admin + url.signIn, {
            username: username,
            password: password
        });
    };
}])
.factory('postSignUp', ['$http', function($http){
    return function (option){
        return $http.post(url.admin + url.signUp, {
            username: option.username,
            password: option.password,
            email: option.email,
            rePwd: option.rePwd
        });
    };
}]);