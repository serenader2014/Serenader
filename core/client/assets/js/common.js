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

$('a,span,button,li').on('click', function () {
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

$('.db-preview').on('click', function (e) {
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

$('.checkbox').on('click', function () {
    console.log('clik');
    if ($(this).find('input[type="checkbox"]').prop('checked')) {
        $(this).find('input[type="checkbox"]').prop('checked', false);
        $(this).find('i').removeClass('fa-check-square-o').addClass('fa-square-o');
    } else {
        $(this).find('input[type="checkbox"]').prop('checked', true);
        $(this).find('i').removeClass('fa-square-o').addClass('fa-check-square-o');
    }
});


function msg (type, str, callback, time) {
    var t = 'msg-' + type,
        msgContainer = $('<div>').addClass('msg'),
        msgWrapper = $('<div>').addClass('msg-wrapper'),
        msgContent = $('<div>').addClass('msg-content');

    msgContainer.append(msgWrapper.append(msgContent));
    $('body').append(msgContainer);

    msgContainer.fadeIn(200).addClass(t);
    msgContent.html(str);
    setTimeout(function () {
        msgContainer.fadeOut(200, function () {
            msgContainer.remove();
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