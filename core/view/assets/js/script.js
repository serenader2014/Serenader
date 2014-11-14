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
        this.dialog = $('<div>').addClass('dialog');
        this.wrapper = $('<div>').addClass('dialog-wrapper');
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
            if (event.target === self.wrapper[0]) {
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
                self.wrapper.append(
                    self.container
                        .append(self.header)
                        .append(self.body)
                        .append(self.footer.append(self.cancel).append(self.confirm))
                )
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

    Serenader.modules.Progress = function (content) {
        this.progress = $('<div>').addClass('progress');
        this.container = $('<span>').addClass('progress-container').html(content);
        this.closeBtn = $('<span>').addClass('md-close progress-btn');
        this.init();
    };

    Serenader.modules.Progress.prototype.init = function () {
        var self = this;
        self.closeBtn.on('click', function () {
            self.hide();
        });
    };

    Serenader.modules.Progress.prototype.show = function () {
        $('body').append(this.progress.append(this.container).append(this.closeBtn));
    };

    Serenader.modules.Progress.prototype.hide = function () {
        this.progress.remove();
    };

    Serenader.progress = function (content, callback) {
        var p;
        if (!content || typeof content !== 'string') {
            return content;
        }
        p = new Serenader.modules.Progress(content);
        p.show();
        callback(function (end) {
            p.hide();
            end();
        });
    };

    Serenader.modules.MsgBox = function (content) {
        this.msgBox = $('<div>').addClass('msg-box');
        this.wrapper = $('<div>').addClass('msg-box-wrapper');
        this.container = $('<div>').addClass('msg-box-container');
        this.content = $('<div>').addClass('msg-box-content').html(content);
        this.closeBtn = $('<button>').addClass('msg-box-close btn btn-blue').html('确定');
        this.init();
    };

    Serenader.modules.MsgBox.prototype.init = function () {
        var self = this;
        self.closeBtn.on('click', function () {
            self.close();
        });

        self.msgBox.on('click', function (event) {
            if (event.target === self.wrapper[0]) {
                self.close();
            }   
        });
    };

    Serenader.modules.MsgBox.prototype.show = function () {
        $('body').append(this.msgBox.append(this.wrapper.append(this.container).append(this.closeBtn)));
        $('body').append(
            this.msgBox.append(
                this.wrapper.append(
                    this.container.append(this.content).append(this.closeBtn)
                )
            )
        );
    };

    Serenader.modules.MsgBox.prototype.close = function () {
        this.msgBox.remove();
    };


    Serenader.msgBox = function (content) {
        var msg;
        if (!content || typeof content !== 'string') {
            return content;
        }
        msg = new Serenader.modules.MsgBox(content);
        msg.show();
    };

    if (callback && typeof callback === 'function') {
        callback.call(Serenader);
    }
    Serenader.init();
})($, this, function () {
    var self = this;
    self.extend({
        events: {
            'click|body|.ripple': 'ripple',
            'focus|body|.input input': 'focusInput',
            'blur|body|.input input': 'blurInput',
            'change|body|.input input': 'changeInput',
            'change|body|[data-validate]': 'validator'
        },
        ripple: function (event) {
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
        },
        validator: function () {
            var self = this,
                options = $(self).attr('data-validate'),
                value = $(self).val(),
                length = value.length,
                tmp = true,
                msg = {
                    lengthTooShort: '输入的长度太短。',
                    lengthTooLong: '输入的长度太长。',
                    notEmail: '不是有效的邮箱。',
                    notAlphanumeric: '输入的内容不是数字字母组合。',
                    notAlphaOrNumeric: '输入的内容不是数字或字母。',
                    notAlpha: '输入的内容不是字母。',
                    notNumeric: '输入的内容不是数字。'
                },
                regExp = {
                    email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
                    alphanumeric: /^[a-zA-Z0-9]+$/,
                    alpha: /^[a-zA-Z]+$/,
                    numeric: /^-?[0-9]+$/
                },
                handleError = function (errorMsg) {
                    $(self).parent()
                        .addClass('input-error')
                        .find('.input-errmsg').remove().end()
                        .append($('<span>').addClass('input-errmsg').html(errorMsg));
                },
                handleSuccess = function () {
                    $(self).parents('.input')
                        .removeClass('input-error')
                        .find('.input-errmsg').remove();
                };

            try {
                options = JSON.parse(options);
            } catch (err) {
                console.error('can not parse input options');
                return false;
            }

            if (options.maxLength && length > options.maxLength) {
                handleError(msg.lengthTooLong);
                return false;
            }

            if (options.minLength && length < options.minLength) {
                handleError(msg.lengthTooShort);
                return false;
            }

            if (options.type) {
                switch (options.type) {
                    case 'alphanumeric': 
                        if (! regExp.alphanumeric.test(value)) {
                            handleError(msg.notAlphanumeric);
                            tmp = false;
                        }
                        break;
                    case 'alpha': 
                        if (! regExp.alpha.test(value)) {
                            handleError(msg.notAlpha);
                            tmp = false;
                        }
                        break;
                    case 'numeric': 
                        if (! regExp.numeric.test(value)) {
                            handleError(msg.notNumeric);
                            tmp = false;
                        }
                        break;
                    case 'alphaOrNumeric':
                        if (!regExp.alpha.test(value) &&
                            !regExp.numeric.test(value)) {
                            handleSuccess(msg.notAlphaOrNumeric);
                            tmp = false;
                        }
                        break;
                    case 'email':
                        if (!regExp.email.test(value)) {
                            handleError(msg.notEmail);
                            tmp = false;
                        }
                }
            }

            if (tmp) {
                handleSuccess();
            }
        }
    });
});