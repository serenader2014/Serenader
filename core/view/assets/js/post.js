/* global CodeMirror, $, marked, Serenader */
(function () {
    var editor = CodeMirror.fromTextArea($('#editor')[0], {
        mode: null,
        indentUnit: 4,
        lineWrapping: true,
    });

    editor.on('change', function () {
        if (($('.post-editor').hasClass('fullscreen') && $('body').width() > 720)) {
            $('.preview').html(marked(editor.getValue()));
        }
    });

    $('.categories').lightSelector();

    $('.fullscreen-btn').on('click', function () {
        $('.post-editor').toggleClass('fullscreen');
        $('.preview').html(marked(editor.getValue()));
        if ($(this).hasClass('md-fullscreen')) {
            $(this).addClass('md-fullscreen-exit').removeClass('md-fullscreen');
        } else {
            $(this).addClass('md-fullscreen').removeClass('md-fullscreen-exit');
        }
    });

    $('.preview-btn').on('click', function () {
        $(this).toggleClass('active');
        $('.preview').html(marked(editor.getValue()));
        $('.preview').toggleClass('mobile-preview');
    });

    $('.image-btn').on('click', function () {
        Serenader.openDialog({
            title: '插入图片',
            content: $('#insert-template').html(),
            task: function () {

            }
        });
    });

    $('body').on('click', '.insert-image .type', function () {
        $(this).parents('li').addClass('active').siblings().removeClass('active');
    });

    $('.global-btn').hide();
})();