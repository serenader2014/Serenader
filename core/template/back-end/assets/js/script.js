/* global $ */

(function ($, window, callback, undefined) {
    var Serenader = {
            events: {},
            modal: {}
        };
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

    Serenader.modal.Dialog = function () {
        var $dialog = $('<div>').addClass('dialog'),
            $container = $('<div>').addClass('dialog-container'),
            $header = $('<div>').addClass('dialog-header'),
            $body = $('<div>').addClass('dialog-body'),
            $footer = $('<div>').addClass('dialog-footer'),
            $cancel = $('<button>').addClass('btn ripple ripple-black'),
            $confirm = $('<button>').addClass('btn btn-primary btn-grey ripple ripple-black');
        


    };

    if (callback && typeof callback === 'function') {
        callback.call(Serenader);
    }

    Serenader.init();
})($, this, function () {
    this.extend({
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
        }
    });

});