/* global $ */

var Serenader = {
        events: {},
        modules: {}
    };
(function ($, window, callback, undefined) {
    Serenader.extend = function (obj) {
        if (typeof obj !== 'object') {
            return false;
        }
        if (obj.events && typeof obj.events === 'object') {
            for (var i in obj.events) {
                if (obj.events[i]) {
                    Serenader.events[i] = obj.events[i];
                }
            }
        }

        for (var j in obj) {
            if (obj[j]) {
                Serenader[j] = obj[j];
            }
        }
    };

    Serenader.init = function () {
        for (var i in this.events) {
            if (this.events[i]) {
                var tmpArr = i.split('|'),
                    type = tmpArr[0],
                    target = tmpArr[1],
                    realTarget,
                    handler = this[this.events[i]];


                if (tmpArr.length === 2) {
                    $(target).on(type, handler);
                } else if (tmpArr.length === 3) {
                    realTarget = tmpArr[2];
                    $(target).on(type, realTarget, handler);
                }
            }
        }
    };

    Serenader.modules.Dialog = function (options) {
        if (!options || typeof options !== 'object') {
            return options;
        }
        this.dialog = $('<div>').addClass('dialog');
        this.container = $('<div>').addClass('dialog-container');
        this.header = $('<div>').addClass('dialog-header').html(options.title);
        this.body = $('<div>').addClass('dialog-body').append(options.content);
        this.footer = $('<div>').addClass('dialog-footer');
        this.cancel = $('<button>').addClass('btn ripple ripple-black').html('Cancel');
        this.confirm = $('<button>').addClass('btn btn-grey ripple').html('confirm');
        this.init();
    };

    Serenader.modules.Dialog.prototype.init = function () {
        var self = this;
        self.show();
        self.dialog.on('click', function (event) {
            if (event.target === self.dialog[0]) {
                if (self.remove) {
                    self.dialog.remove();
                } else {
                    self.hide();
                }
            }
        });

        self.cancel.on('click', function () {
            self.hide();
        });
    };

    Serenader.modules.Dialog.prototype.show = function () {
        var self = this;        
        $('body').append(
            self.dialog.append(
                self.container
                    .append(self.header)
                    .append(self.body)
                    .append(self.footer.append(self.cancel).append(self.confirm))
            )
        );

        self.container.addClass('dialog-active');
    };

    Serenader.modules.Dialog.prototype.hide = function () {
        var self = this;
        self.dialog.addClass('dialog-hide');
        setTimeout(function () {
            self.dialog.remove();
        }, 200);
    };

    Serenader.openDialog = function (options) {
        if (options && typeof options === 'object') {
                var dialog = new this.modules.Dialog({
                    title: options.title || 'No title',
                    content: options.content || ''
                });

                if (options.task && typeof options.task === 'function') {
                    dialog.confirm.on('click', options.task);
                }
        } else {
            return options;
        }
    };
    if (callback && typeof callback === 'function') {
        callback.call(Serenader);
    }
    Serenader.init();
})($, this, function () {
    var self = this;
    self.extend({
        events: {
            'click|.ripple': 'ripple',
            'focus|body|.input input': 'focusInput',
            'blur|body|.input input': 'blurInput',
            'change|body|.input input': 'changeInput'
        },
        ripple: function (event) {
            event.preventDefault();
            if ($(this).find('.ink').length === 0) {
                $(this).append($('<span>').addClass('ink'));
            }
            var ink = $(this).find('.ink');
            ink.removeClass('animate');
            
            if (!ink.width() && !ink.height()) {
                var d = Math.max($(this).width(), $(this).height());
                ink.css({width: d + 'px', height: d + 'px'});
            }
            
            var x = event.pageX - $(this).offset().left - ink.width() / 2;
            var y = event.pageY - $(this).offset().top - ink.height() / 2;
            
            ink.css({top: y + 'px', left: x + 'px'}).addClass('animate');
        },
        focusInput: function () {
            if (! $(this).parents('.input').hasClass('input-disabled')) {
                $(this).parents('.input').addClass('is-focus');
            }
        },
        blurInput: function () {
            $(this).parents('.input').removeClass('is-focus');
        },
        changeInput: function () {
            if ($(this).val()) {
                $(this).parents('.input').addClass('has-value');
            } else {
                $(this).parents('.input').removeClass('has-value');
            }
        }
    });

});