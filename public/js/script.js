// $("input:checkbox, input:radio").iCheck({
//     checkboxClass: "icheckbox_flat-blue"
// });


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