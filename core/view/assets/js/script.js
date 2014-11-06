/* global $ */

var Serenader = {
        events: {},
        modal: {}
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
                var type = i.split(' ')[0],
                    target = i.split(' ')[1],
                    handler = this[this.events[i]];

                $('body').on(type, target, handler);
            }
        }
    };

    Serenader.modal.Dialog = function (obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        this.dialog = $('<div>').addClass('dialog');
        this.container = $('<div>').addClass('dialog-container');
        this.header = $('<div>').addClass('dialog-header').html(obj.title);
        this.body = $('<div>').addClass('dialog-body').append(obj.content);
        this.footer = $('<div>').addClass('dialog-footer');
        this.cancel = $('<button>').addClass('btn ripple ripple-black');
        this.confirm = $('<button>').addClass('btn btn-primary btn-grey ripple ripple-black');
        this.init();
    };

    Serenader.modal.Dialog.prototype.init = function () {
        $('body').append(
            this.dialog.append(
                this.container
                    .append(this.header)
                    .append(this.body)
                    .append(this.footer.append(this.cancel).append(this.confirm))
            )
        );
    };
    if (callback && typeof callback === 'function') {
        callback.call(Serenader);
    }
    Serenader.init();
})($, this, function () {
    var self = this;
    self.extend({
        events: {
            'click .ripple': 'ripple',
            'click [data-toggle="dialog"]': 'openDialog'
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
        openDialog: function (event) {
            event.preventDefault();
            var title = $(this).data('title'),
                content = $($(this).data('content')).html(),
                dialog = new self.modal.Dialog({
                    title: title,
                    content: content
                });
        }
    });

});