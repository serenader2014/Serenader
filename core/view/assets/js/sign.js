/* global Backbone, $ */

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
        });
    },
    signIn: function () {
        var userName = $('input[]').val(),
            password = $('input[]').val();

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
    }
});

signIn = new SignInView();
