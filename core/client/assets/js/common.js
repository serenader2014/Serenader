// $("input:checkbox, input:radio").iCheck({
//     checkboxClass: "icheckbox_flat-blue"
// });

var progress = {
    show: function (str, callback) {
        var psContainer = $('<div>').addClass('progress'),
            psInner = $('<div>').addClass('progress-inner'),
            psContent = $('<div>').addClass('progress-content'),
            psIcon = $('<i>').addClass('fa').addClass('fa-spin').addClass('fa-spinner'),
            psText = $('<span>');

        psText.html(str);
        $('body').append(psContainer);
        psContainer.append(psInner.append(psContent.append(psIcon).append(psText)));
        $('.progress').fadeIn(200, function () {
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    },
    hide: function (callback) {
        $('.progress').fadeOut(200, function () {
            $(this).remove();
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    }
};

$('a,span,button').on('click', function () {
    if ($(this).data('toggle') === 'modal') {
        var target = $(this).data('target');
        $(target).fadeIn(100);
    }
});

$('.modal').on('click', function (e) {
    if (e.target === this) {
        $(this).fadeOut(100);
    }
});

$('button').on('click', function (e) {
    if ($(this).data('dismiss') === 'modal') {
        e.preventDefault();
        $(this).parents('.modal').fadeOut(100);
    }
});


function msg (type, str, callback, time) {
    var t = 'msg-' + type,
        msgContainer = $('<div>').addClass('msg'),
        msgWrapper = $('<div>').addClass('msg-wrapper'),
        msgContent = $('<div>').addClass('msg-content');

    msgContainer.append(msgWrapper.append(msgContent));
    $('body').append(msgContainer);

    $('.msg').fadeIn(200).addClass(t);
    $('.msg-content').html(str);
    setTimeout(function () {
        $('.msg').fadeOut(200, function () {
            $('.msg').remove();
        });
        if (callback && typeof callback === 'function') {
            callback();
        }
    }, time && typeof time === 'number' ? time : 2000);
}



$('.db-header-nav .navbar-btn').on('click', function () {
    $('.db-nav').slideToggle(200);
    $(this).toggleClass('active');
});