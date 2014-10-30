(function () {
    var editor = CodeMirror.fromTextArea($('#new-post-area')[0], {
        mode: null,
        indentUnit: 4,
        lineWrapping: true,
        extraKeys: {
            'F11': fullScreen,
            'Ctrl-P': mdPreview,
            'Alt-C': closePreview,
            'Ctrl-I': insertImage
        }
        }),
        previousTitle = $('input[name="title"]').val(),
        previousPost = editor.getValue(),
        previousTags = [],
        previousCategory = $('option:selected').val();
    $('input[name="tags"]').each(function (index, item) {
        previousTags.push($(item).val());
    }); 
    var editorContainer = $('.db-new-editor');
    editor.on('change', function () {
        if (editorContainer.hasClass('editor-fullscreen')) {
            $('.fs-preview-container').html(marked(editor.getValue()));
        }
    });
    var updatePost = function (publish, callback) {
        var tags = [],
            title = $('input[name="title"]').val(),
            category = $('option:selected').val(),
            post = editor.getValue();
        $('input[name="tags"]').each(function (index, item) {
            tags.push($(item).val()); 
        });
        if (! publish &&
            previousCategory === category &&
            previousTags.toString() === tags.toString() &&
            previousPost === post &&
            previousTitle === title) {
            return ;
        } else {
            previousTitle = title;
            previousPost = post;
            previousTags = tags;
            previousCategory = category;
            $.ajax({
                url: url.admin + url.adminEditPost + '/' + post._id,
                type: 'POST',
                data: {
                    title: title || 'No title',
                    categories: category,
                    post: post,
                    tags: tags,
                    publish: publish || false
                },
                success: function (data) {
                    if (data.status === 1) {
                        var time = new Date();
                        if (! publish) {
                            $('.db-draft-info').html('Draft saved in '+time.toTimeString());
                            setTimeout(function () {
                                $('.db-draft-info').html('');
                            }, 5000);
                        }
                        if (callback) {
                            callback(true);
                        }
                    } else {
                        if (! publish) {
                            $('.db-draft-info').html('Update draft error');
                        }
                        if (callback) {
                            callback();
                        }
                    }
                },
                error: function (err) {
                    msg('error', '提交文章到服务器失败！' + err.statusText);
                }                        
            });        
        }
    };

    var update = setInterval(updatePost, 10000);
    $('.db-save-draft').on('click', function () {
        updatePost();
    });
    $('.db-publish').on('click', function (event) {
        event.preventDefault();
        progress.show('文章更新中...', function () {
            var title = $('input[name="title"]').val();
            var category = $('option:selected').val();
            var post = editor.getValue();
            if ( !title || !category || !post) {
                progress.hide(function () {
                    msg('error', '请完善文章信息。');
                });
                return false;
            }
            updatePost(true, function (result) {
                progress.hide(function () {
                    if (result) {
                        msg('success', '文章更新成功！', function () {
                            window.location = url.admin + url.adminPost;
                        });
                    } else {
                        msg('error', '文章发表失败！');
                    }
                });
            });
        });
    });
    editor.focus();
    $('select').lightSelector().setSize({
        width: 200,
        height: 60
    });
    $('.db-editor-fs').on('click', function () {
        fullScreen();
    });
    $('.db-editor-preview').on('click', function () {
        mdPreview();
    });
    $('.db-preview-close').on('click', function () {
        closePreview();
    });

    $('.db-tag').on('keyup', function (event) {
            if (event.which === 188){
                $(this).val($(this).val().slice(0,$(this).val().length-1));
                addTag();
                $(this).val("");
            }
    }).on('blur', function (event) {
            if ($(this).val() !== "") {
                addTag();
                $(this).val("");
            }
    }).on('keydown', function (event) {
        if (event.which === 8 ) {
            if ($(this).val() === "") {
                $(".db-single-tag:last").remove();
            }
        }
    });

    function addTag () {
        var tag = $("<a class='db-single-tag' href='javascript:;'></a>");
        var tagInput = $("<input name='tags' class='db-tag-input' />");
        tag.html($(".db-tag").val());
        tag.prepend($("<i class='fa fa-tag'></i>"));
        tagInput.val(tag.text());
        $(".db-tag").before(tag);
        tag.append(tagInput);
    }

    $('.db-tags').on('click','.db-single-tag', function () {
        $(this).remove();
    }).on('click', function () {
        $('.db-tag').focus();
    });

    function mdPreview () {
        $('.db-preview-main').html(marked(editor.getValue()));
        $('.db-preview').fadeIn();
        editor.focus();
    }

    function fullScreen () {
        $('.db-new-editor').toggleClass('editor-fullscreen');
        $('.fs-preview-container').html(marked(editor.getValue()));

    }

    function closePreview () {
        $('.db-preview').fadeOut();
    }

    function insertImage () {
        $('.db-editor-insertimg').trigger('click');
    }            

    $('.insert-img').on('click', function (event) {
        event.preventDefault();
        var imgUrl = $('.imgurl input').val();
        editor.replaceSelection('![]('+imgUrl+')');
        $('#insert .close').trigger('click');
    });

    $('.imgurl input').on('keydown', function (event) {
        if (event.which === 13) {
            event.preventDefault();
            $('.insert-img').trigger('click');
        }
    });

    $('.select-another').on('click', function (event) {
        event.preventDefault();
        $('.upload-picker').trigger('click');
    });

    $('.remove-img').on('click', function (event) {
        event.preventDefault();
        var url = $(this).data('url'),
            imageVersions = $(this).data('imageVersions');
        $.ajax({
            type: 'DELETE',
            url: url,
            data: {
                imageVersions: Object.keys(imageVersions)
            },
            dataType: 'json', 
            success: function (result) {
                if (result.status === 1) {
                    $('.preview-container').hide();
                    $('.upload-picker').show();
                    $('.imgurl input').val('').show();
                    $('.fileinput').show();
                } else {
                    msg('error', '删除原来的图片失败！');
                }
            },
            error: function (err) {
                msg('error', err.statusText);
            }
        });
    });

    $('body').on('click', function () {
        if (! $('#insert').is(':visible')) {
            $('.preview-container').hide();
            $('.upload-fail').hide();
            $('.upload-picker').show();
        }
    });
    $('#uploader').fileupload({
        dropZone: $('#uploader'),
        autoUpload: true,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        url: url.admin + url.adminUpload + '/public/post_attachment',
    }).on('fileuploadadd', function (e, data) {
        $('.upload-picker').hide();
        $('.imgurl input').hide();
        $('.fileinput').hide();
    }).on('fileuploadstart', function (e, data) {
        $('.upload-progress').show();
    }).on('fileuploadprogress', function (e, data) {
        var percentage = parseInt(data.loaded/data.total * 100, 10);
        $('.upload-progress-inner').animate({
            width: percentage + '%'
        });
    }).on('fileuploaddone', function (e, data) {
        var img  = data.result[0];
        $('.upload-progress').hide();
        $('.preview-container')
            .find('img').remove().end()
            .append($('<img class="img-preview"/>')
            .attr('src', img.imageVersions.thumbnail))
            .show();
        $('.remove-img').data('url', img.deleteUrl).data('imageVersions', img.imageVersions);
        $('.imgurl input').val(img.url).hide();
    }).on('fileuploadfail', function (e, data) {
        $('.upload-progress').hide();
        $('.upload-fail').show();
        $('.upload-error-text').html(data.textStatus);
        $('.upload-error-detail').html(data.errorThrown);
    });         
})();