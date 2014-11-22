/* global Backbone, $, url, Serenader, window */
(function () {
    var SignInView, SignUpView, signIn, signUp;

    SignInView = Backbone.View.extend({
        el: $('.sign'),
        events: {
            'click .signup-btn': 'showSignUp',
            'click .signin .sign-btn': 'signIn'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var tmpl = $('#signin').html();
            this.$el.append($(tmpl));
        },
        showSignUp: function () {
            var self = this;
            self.$el.find('.signin').fadeOut(function () {
                var view = self.$el.find('.signup');
                if (view.length === 0) {
                    signUp = new SignUpView();
                } else {
                    view.fadeIn();
                }
                $('title').html('注册');
            });
        },
        signIn: function () {
            var userName = $('.signin input[name="username"]').val(),
                password = $('.signin input[name="password"]').val();

            if (!userName || !password || $('.signin').find('.input-error').length > 0) {
                return false;
            }

            Serenader.progress('正在登录...', function (finish) {
                $.ajax({
                    url: url.admin + url.signIn,
                    data: {
                        username: userName,
                        password: password
                    },
                    type: 'POST',
                    dataType: 'json',
                    success: function (result) {
                        finish(function () {
                            if (result.ret === 0) {
                                Serenader.msgBox('登录成功！', function () {
                                    window.location = url.admin;
                                });
                            } else {
                                Serenader.msgBox('登录失败！' + result.error, 'error');
                            }
                        });
                    },
                    error: function (err) {
                        finish(function () {
                            Serenader.msgBox('请求失败！' + err, 'error');
                        });
                    }
                });
            });

        }
    });

    SignUpView = Backbone.View.extend({
        el: $('.sign'),
        events: {
            'click .signin-btn': 'showSignIn',
            'click .sign-btn': 'signUp'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var tmpl = $('#signup').html();
            this.$el.append($(tmpl));
        },
        showSignIn: function () {
            var self = this;
            self.$el.find('.signup').fadeOut(function () {
                self.$el.find('.signin').fadeIn();
            });
            $('title').html('登录');
        },
        signUp: function () {
            var userName = $('.signup input[name="username"]').val(),
                password = $('.signup input[name="password"]').val(),
                email = $('.signup input[name="email"]').val(),
                rePwd = $('.signup input[name="re-password"]').val();

            if (!userName || !password || !email || !rePwd || $('.signup').find('.input-error').length > 0) {
                return false;
            }

            if (rePwd !== password) {
                Serenader.msgBox('两次输入的密码不一致！', 'error');
                return false;
            }

            Serenader.progress('正在注册...', function (finish) {
                $.ajax({
                    url: url.admin + url.signUp,
                    type: 'POST',
                    data: {
                        id: userName,
                        email: email,
                        password: password,
                        rePwd: rePwd
                    },
                    dataType: 'json',
                    success: function (result) {
                        finish(function () {
                            if (result.ret === 0) {
                                Serenader.msgBox('注册成功！点击确定立即登录。', function () {
                                    window.location = url.admin + url.sign;
                                });
                            } else {
                                Serenader.msgBox('注册失败！'+ result.error, 'error');
                            }
                        });
                    },
                    error: function (err) {
                        finish(function () {
                            Serenader.msgBox('请求失败！' + err, 'error');
                        });
                    }
                });
            });
        }
    });

    signIn = new SignInView();
})();