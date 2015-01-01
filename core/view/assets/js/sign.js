angular.module('serenader', [
    'ngRoute',
    'appModule'
])
.controller('signController', function () {

})
.controller('signInController', ['$scope', function ($scope) {
    $scope.redirect = function () {
        //////////////////////////////////
        // window.location = url.admin; //
        //////////////////////////////////
        ///
        console.log('click');
        return false;
    };

    $scope.signInSuccess = true;
    $scope.signIn = function () {
        if (!$scope.username || !$scope.password) {
            alert('请完善表单内容！');
            return false;
        }
        $scope.onSignIn = true;
        setTimeout(function () {

            $.ajax({
                url: url.admin + url.signIn,
                data: {
                    username: $scope.username,
                    password: $scope.password
                },
                type: 'POST',
                dataType: 'json',
                success: function (result) {
                    $scope.onSignIn = false;
                    if (result.ret === 0) {
                        $scope.signInSuccess = true;
                    } else {
                        $scope.networkError = false;
                        $scope.signInSuccess = false;
                    }
                    $scope.$digest();
                },
                error: function (err) {
                    $scope.signInSuccess = false;
                    $scope.onSignIn = false;
                    $scope.networkError = err;
                    $scope.$digest();

                }
            });
        }, 1000);
    };
}])
.controller('signUpController', ['$scope', function ($scope) {
    $scope.signUp = function () {
        $scope.onSignUp = true;
    };
}])
.config(function ($routeProvider) {
    $routeProvider
    .when('/signin', {
        templateUrl: assets.server + '/views/signin.html',
        controller: 'signInController'
    })
    .when('/signup', {
        templateUrl: assets.server + '/views/signup.html',
        controller: 'signUpController'
    })
    .otherwise({
        redirectTo: '/signin'
    });
});


// (function () {
//     var SignInView, SignUpView, signIn, signUp;

//     SignInView = Backbone.View.extend({
//         el: $('.sign'),
//         events: {
//             'click .signup-btn': 'showSignUp',
//             'click .signin .sign-btn': 'signIn'
//         },
//         initialize: function () {
//             this.render();
//         },
//         render: function () {
//             var tmpl = $('#signin').html();
//             this.$el.append($(tmpl));
//         },
//         showSignUp: function () {
//             var self = this;
//             self.$el.find('.signin').fadeOut(function () {
//                 var view = self.$el.find('.signup');
//                 if (view.length === 0) {
//                     signUp = new SignUpView();
//                 } else {
//                     view.fadeIn();
//                 }
//                 $('title').html('注册');
//             });
//         },
//         signIn: function () {
//             var userName = $('.signin input[name="username"]').val(),
//                 password = $('.signin input[name="password"]').val();

//             if (!userName || !password || $('.signin').find('.input-error').length > 0) {
//                 return false;
//             }

//             Serenader.progress('正在登录...', function (finish) {
//             });

//         }
//     });

//     SignUpView = Backbone.View.extend({
//         el: $('.sign'),
//         events: {
//             'click .signin-btn': 'showSignIn',
//             'click .sign-btn': 'signUp'
//         },
//         initialize: function () {
//             this.render();
//         },
//         render: function () {
//             var tmpl = $('#signup').html();
//             this.$el.append($(tmpl));
//         },
//         showSignIn: function () {
//             var self = this;
//             self.$el.find('.signup').fadeOut(function () {
//                 self.$el.find('.signin').fadeIn();
//             });
//             $('title').html('登录');
//         },
//         signUp: function () {
//             var userName = $('.signup input[name="username"]').val(),
//                 password = $('.signup input[name="password"]').val(),
//                 email = $('.signup input[name="email"]').val(),
//                 rePwd = $('.signup input[name="re-password"]').val();

//             if (!userName || !password || !email || !rePwd || $('.signup').find('.input-error').length > 0) {
//                 return false;
//             }

//             if (rePwd !== password) {
//                 Serenader.msgBox('两次输入的密码不一致！', 'error');
//                 return false;
//             }

//             Serenader.progress('正在注册...', function (finish) {
//                 $.ajax({
//                     url: url.admin + url.signUp,
//                     type: 'POST',
//                     data: {
//                         id: userName,
//                         email: email,
//                         password: password,
//                         rePwd: rePwd
//                     },
//                     dataType: 'json',
//                     success: function (result) {
//                         finish(function () {
//                             if (result.ret === 0) {
//                                 Serenader.msgBox('注册成功！点击确定立即登录。', function () {
//                                     window.location = url.admin + url.sign;
//                                 });
//                             } else {
//                                 Serenader.msgBox('注册失败！'+ result.error, 'error');
//                             }
//                         });
//                     },
//                     error: function (err) {
//                         finish(function () {
//                             Serenader.msgBox('请求失败！' + err, 'error');
//                         });
//                     }
//                 });
//             });
//         }
//     });

//     signIn = new SignInView();
// })();