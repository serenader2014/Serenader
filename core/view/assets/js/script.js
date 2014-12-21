/* global $, window */

(function ($, window, callback, undefined) {
    var Serenader = {
            events: {},
            modules: {}
        },
        extend = function (target, obj) {
            if (typeof obj !== 'object') {
                return false;
            }

            for (var i in obj) {
                if (obj[i] && typeof target[i] === 'undefined') {
                    target[i] = obj[i];
                }
            }
            
        };
    Serenader.extend = function (obj) {
        extend(this, obj);
    };

    Serenader.init = function () {
        this.fire();
        Serenader.events = {};
    };

    Serenader.addEvents = function (obj) {
        extend(this.events, obj);
    };

    Serenader.fire = function () {
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
        this.cancel = $('<button>').addClass('btn ripple ripple-black').html('关闭');
        this.confirm = $('<button>').addClass('btn btn-grey ripple').html('确定');
        this.init();
    };

    Serenader.modules.Dialog.prototype.init = function () {
        var self = this;
        self.show();
        self.dialog.on('click', function (event) {
            if (event.target === self.wrapper[0]) {
                self.hide();
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
                var dialog;

                if (options.rendererData && typeof options.rendererData === 'object') {
                    for (var i in options.rendererData) {
                        if (options.rendererData[i]) {
                            var regExp = new RegExp('{{' + i + '}}', 'gi');
                            options.content = options.content.replace(regExp, options.rendererData[i]);
                        }
                    }
                }

                dialog = new this.modules.Dialog({
                    title: options.title || 'No title',
                    content: options.content || ''
                });

                if (options.task && typeof options.task === 'function') {
                    dialog.confirm.on('click', function () {
                        options.task.call(dialog);
                    });
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

    Serenader.modules.MsgBox = function (content, type, callback) {
        this.msgBox = $('<div>').addClass('msg-box').addClass(type);
        this.wrapper = $('<div>').addClass('msg-box-wrapper');
        this.container = $('<div>').addClass('msg-box-container');
        this.content = $('<div>').addClass('msg-box-content').html(content);
        this.closeBtn = $('<button>').addClass('msg-box-close btn btn-blue').html('确定');
        this.callback = callback;
        this.init();
    };

    Serenader.modules.MsgBox.prototype.init = function () {
        var self = this;
        self.closeBtn.on('click', function () {
            self.close();
            if (self.callback && typeof callback === 'function') {
                self.callback();
            }
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


    Serenader.msgBox = function (content, type, callback) {
        var msg;
        if (!content || typeof content !== 'string') {
            return content;
        }
        if (typeof type === 'undefined') {
            type = '';
        }
        if (type && typeof type === 'function') {
            callback = type;
            type = '';
        }
        msg = new Serenader.modules.MsgBox(content, type, callback);
        msg.show();
    };

    if (callback && typeof callback === 'function') {
        callback.call(Serenader);
    }
    Serenader.init();
    window.Serenader = Serenader;
})($, typeof window !== 'undefined' ? window : this, function () {
    var self = this;
    self.addEvents({
        'click|body|.ripple': 'ripple',
        'focus|body|.input input': 'focusInput',
        'blur|body|.input input': 'blurInput',
        'change|body|.input input': 'changeInput',
        'change|body|[data-validate]': 'validator',
        'click|.user-avatar a': 'showProfile',
        'click|.side-menu-btn': 'showSideMenu',
        'click|.global-btn': 'showNewPost',
        'click|body': 'blur',
    });
    self.extend({
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
        },
        showProfile: function () {
            $('.sub-menu').toggle();
        },
        showSideMenu: function () {
            if ($('body').width() > 720) {
                return false;
            }
            $('.side-menu').toggleClass('show');
        },
        showNewPost: function () {
            window.location = url.admin + url.newPost;
        },
        blur: function (event) {
            var target = event.target,
                isProfileShown = $('.sub-menu').is(':visible'),
                isSideMenuShown = $('.side-menu').hasClass('show');

            if (isProfileShown && $(target).parents('.sub-menu').length === 0 && $(target).parents('.user-avatar').length === 0) {
                self.showProfile();
            }

            if (isSideMenuShown && $(target).parents('.side-menu').length === 0 && $(target).parents('.side-menu-btn').length === 0) {
                self.showSideMenu();
            }

        }
    });
});

/* LightSelector@Serenader: https://github.com/serenader2014/LightSelector */

(function (global, factory) {

    factory(global);

})(this, function (window) {

    function LightSelector (e) {
        var self = this;

        self.e = e;
        self.origin = {
            options: function () {
                return self.e.find('option');
            },
            selected: function () {
                return self.e.find('option:selected');
            }
        };
        self.options = (function () {
            var arr = [];
            self.origin.options().each(function (index, o) {
                arr.push($(o).html());
            });

            return arr;
        })();
        self.current = self.origin.options().index(self.origin.selected());
        self.status = {
            isExpanded: false
        };
    }

    LightSelector.count = 1;

    LightSelector.prototype = {
        constructor: LightSelector,
        init: function (opt) {
            var self = this;

            self.createUI().eventBinding();
            
            return self;
        },
        createUI: function () {
            var self = this;

            var selector = $('<div>')
                    .addClass(self.css.selector.substring(1))
                    .addClass('s-'+(++LightSelector.count)),
                
                selectorWrapper = $('<div>')
                    .addClass(self.css.wrapper.substring(1)),
                
                current = $('<span>')
                    .addClass(self.css.currentSelected.substring(1))
                    .html(self.options[self.current]),
                
                optionsList = $('<ul>')
                    .addClass(self.css.optionsList.substring(1)),

                pageHeight = $(document).height(),
                position,
                height;
                
            selector
                .append(current)
                .append(selectorWrapper.append(optionsList));

            self.e.after(selector);

            self.e.addClass(self.css.selector.substring(1));
            self.origin.options().each(function (index, option) {
                optionsList.append($('<li>').html($(option).html()).addClass(self.current === index ? self.css.optionSelected.substring(1) : ''));
            });

            self.selector = self.e.next();

            position = self.selector.offset();
            height = self.selector.height();
            optionsList.css({maxHeight: pageHeight - (height + position.top) - 20});
            
            return self;
        },
        expand: function () {
            var self = this;
            
            self.getDomElement().wrapper.fadeIn(100);
            self.status.isExpanded = true;
            
            return self;
        },
        collapse: function () {
            var self = this;
            
            self.getDomElement().wrapper.fadeOut(100);
            self.status.isExpanded = false;
            
            return self;
        },
        changeOption: function (index) {
            var self = this;

            self.current = index;
            self.origin.options().eq(index).prop('selected', true);
            self.updateUI(function () {
                self.collapse();
            });

            return self;
        },
        updateUI: function (callback) {
            var self = this;

            self.getDomElement().currentSelected.html(self.options[self.current]);
            self.getDomElement().optionsList.find('li').removeClass(self.css.optionSelected.substring(1))
                .eq(self.current).addClass(self.css.optionSelected.substring(1));

            if (callback && typeof callback === 'function') {
                callback();
            }
            return self;
        },
        eventBinding: function () {
            var self = this;
            
            self.getDomElement().currentSelected.on('click', function () {
                if (self.status.isExpanded) {
                    self.collapse();
                } else {
                    self.expand();
                }
            });

            self.getDomElement().optionsList.find('li').on('click', function () {
                self.changeOption(self.getDomElement().optionsList.find('li').index($(this)));
            });

            $(document).on('click', function (e) {
                if (self.status.isExpanded && $(e.target).parents(self.css.selector).length === 0) {
                    self.collapse();
                } 
            });

            return self;
        },
        css: {
            selector: '.light-selector',
            wrapper: '.ls-wrapper',
            currentSelected: '.ls-current',
            optionsList: '.ls-list',
            optionSelected: '.selected'
        },
        getDomElement: function () {
            var self = this;

            return {
                selector: self.selector,
                wrapper: self.selector.find(self.css.wrapper),
                currentSelected: self.selector.find(self.css.currentSelected),
                optionsList: self.selector.find(self.css.optionsList)
            };
        }

    };

    $.fn.lightSelector = function (opt) {
        return (new LightSelector(this)).init(opt);
    };
});