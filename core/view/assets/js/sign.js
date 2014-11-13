/* global Backbone, $, url */

var SignInView, SignUpView, signIn, signUp;

SignInView = Backbone.View.extend({
    el: $('.sign'),
    events: {
        'click .signup-btn': 'showSignUp',
        'click .sign-btn': 'signIn'
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

        $.ajax({
            url: url.admin + url.adminSignIn,
            data: {
                username: userName,
                password: password
            },
            type: 'POST',
            dataType: 'json',
            success: function (result) {
                if (result.status === 1) {
                } else {
                }
            },
            error: function () {

            }
        });
    }
});

SignUpView = Backbone.View.extend({
    el: $('.sign'),
    events: {
        'click .signin-btn': 'showSignIn'
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
    }
});

signIn = new SignInView();