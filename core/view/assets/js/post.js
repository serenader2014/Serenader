/* global CodeMirror, $, marked */
(function () {
    var editor = CodeMirror.fromTextArea($('#editor')[0], {
        mode: null,
        indentUnit: 4,
        lineWrapping: true,
    });

    editor.on('change', function () {
        if ($('.post-editor').hasClass('fullscreen') && $('body').width() > 720) {
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

})();