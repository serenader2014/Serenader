/* global $, marked, Serenader, hljs, url, window */
(function () {
    var keyMap = {
            ctrl: 17,
            shift: 16,
            alt: 18,
            tab: 9,
            i: 73,
            b: 66,
            p: 80,
            q: 81,
            l: 76,
            k: 75,
            u: 85,
            f11: 122
        },
        regExp = new RegExp(url.adminNewPost, 'ig'),
        draftID = regExp.test(window.location.pathname) ? undefined : window.location.pathname.split('/').pop() ,
        previousTitle = $('.post-head input').val() ,
        previousContent = $('.editor').val() ,
        previousCategory = $('option:selected').val() ,
        previousSlug  = $('.post-head input').attr('data-slug'),
        slug = previousSlug;

    marked.setOptions({
        highlight: function (code) {
            return hljs.highlightAuto(code).value;
        }
    });

    Serenader.addEvents({
        'keyup|.editor' : 'compileMarkdown',
        'keydown|.editor': 'editorShortcut',
        'click|.fullscreen-btn': 'fullScreen',
        'click|.preview-btn': 'preview',
        'click|.image-btn': 'insertImage',
        'click|body|.type': 'showInsertType',
        'click|.publish': 'publish',
        'click|.draft-btn': 'saveDraft',
        'click|.help-btn': 'showHelp',
        'click|.post-setting-btn': 'showPostSetting',
        'change|.post-head input': 'generateSlug'
    });

    Serenader.extend({
        compileMarkdown: function () {
            if (($('.post-editor').hasClass('fullscreen') && $('body').width() > 720)) {
                Serenader.compiler();
            }
        },
        editorShortcut: function (event) {
            var editor = $(this).get(0),
                start = editor.selectionStart,
                end = editor.selectionEnd,
                value = $(this).val(),
                selection = value.substring(start, end);
            switch (event.which) {
                case keyMap.i : 
                    if (event.ctrlKey) {
                        event.preventDefault();
                        if (event.altKey) {
                            Serenader.insertImage();
                        } else {
                            $(this).val(value.substring(0, start)
                                        + '*'
                                        + selection
                                        + '*'
                                        + value.substring(end));
                        }
                    }
                    break;
                case keyMap.tab: 
                    event.preventDefault();
                    $(this).val(value.substring(0, start)
                                + "    "
                                + value.substring(end));

                    editor.selectionStart = editor.selectionEnd = start + 4;
                    break;
                case keyMap.f11: 
                    event.preventDefault();
                    Serenader.fullScreen();
                    break;
                case keyMap.b:
                    if (!event.ctrlKey) {
                        return ;
                    }
                    event.preventDefault();
                    $(this).val(value.substring(0, start)
                                + '**'
                                + selection
                                + '**'
                                + value.substring(end));
                    break;
                case keyMap.q:
                    if (!event.ctrlKey) {
                        return ;
                    }            
                    event.preventDefault();
                    $(this).val(value.substring(0, start)
                                + '> '
                                + selection
                                + value.substring(end));
                    break;
                case keyMap.l:
                    if (!event.ctrlKey) {
                        return ;
                    }             
                    event.preventDefault();
                    $(this).val(value.substring(0, start)
                                + '['
                                + selection
                                + ']()'
                                + value.substring(end));
                    editor.selectionStart = start + selection.length + 3;
                    break;
                case keyMap.k:
                    if (!event.ctrlKey) {
                        return ;
                    }
                    event.preventDefault();
                    if (!event.altKey) {
                        $(this).val(value.substring(0, start)
                                    + '`'
                                    + selection
                                    + '`'
                                    + value.substring(end));                        
                    } else {
                        $(this).val(value.substring(0, start)
                                    + '\n```\n'
                                    + selection
                                    + '\n```\n'
                                    + value.substring(end));
                    }
                    break;
                case keyMap.u:
                    if (!event.ctrlKey) {
                        return ;
                    }
                    event.preventDefault();
                    $(this).val(value.substring(0, start)
                                + '~~'
                                + selection
                                + '~~'
                                + value.substring(end));
                    break;
            }
        },
        fullScreen: function () {
            $('.post-editor').toggleClass('fullscreen');
            Serenader.compiler();
            if ($(this).hasClass('md-fullscreen')) {
                $(this).addClass('md-fullscreen-exit').removeClass('md-fullscreen');
            } else {
                $(this).addClass('md-fullscreen').removeClass('md-fullscreen-exit');
            }
        },
        preview: function () {
            $(this).toggleClass('active');
            $('.preview').toggleClass('mobile-preview');
            Serenader.compiler();
        },
        insertImage: function () {
            Serenader.openDialog({
                title: '插入图片',
                content: $('#insert-template').html(),
                task: function () {
                    var editor = $('.editor'),
                        value = editor.val(),
                        start = editor.get(0).selectionStart,
                        end = editor.get(0).selectionEnd,
                        str = '![image](' + $('.image-url').val() + ')';
                    editor.focus().val(value.substring(0, start) + str + value.substring(end));
                    editor.get(0).selectionStart = start + 2;
                    editor.get(0).selectionEnd = start + 7;
                    this.hide();
                }
            });
            $('.upload-btn').fileupload({
                dropZone: $('#upload'),
                autoUpload: true,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                url: url.admin + url.adminUpload + url.adminPostUpload,
                add: function (e, data) {
                    $('.upload-btn').hide();
                    data.submit();
                },
                progress: function (e, data) {
                    var percentage = parseInt((data.loaded / data.total) * 100, 10) + '%';
                    $('.upload-progress').show();
                    $('.percentage').html(percentage);
                    $('.progress-bar-inner').width(percentage);
                },
                done: function (e, data) {
                    var img = data.result[0];
                    $('.upload-progress').hide();
                    $('.upload-finish').show().find('img').attr('src', img.url);
                    $('.image-url').val(img.url);
                },
                fail: function () {
                    Serenader.msgBox('上传失败！', 'error');
                    $('.upload-finish').hide();
                    $('.upload-btn').show();
                }
            });            
        },
        compiler: function () {
            $('.preview').html(marked($('.editor').val()));
        },
        showInsertType: function () {
            $('.type').removeClass('active');
            $(this).addClass('active');
            $('.content', $('.insert-image')).hide();
            $($(this).attr('data-target')).show();
        },
        updatePost: function (isPublished, callback) {
            var title,
                category,
                content,
                tags,
                editor = $('.editor'),
                targetUrl,
                method;

            title = $('.post-head input').val();
            category = $('option:selected').val();
            content = editor.val();
            tags = $('.tags input').val().split(',');

            if (typeof isPublished === 'undefined') {
                isPublished = false;
            }

            if (! draftID) {
                targetUrl = url.admin + url.adminNewPost;
                method = 'POST';
            } else {
                targetUrl = url.admin + url.adminPost + '/' + draftID;
                method = 'PUT';
            }

            $.ajax({
                url: targetUrl,
                type: method,
                data: {
                    content: content,
                    title: title || 'No title',
                    category: category,
                    tags: tags,
                    publish: isPublished,
                    slug: slug
                },
                dataType: 'json',
                success: function (result) {
                    if (result.status === 1) {
                        if (callback && typeof callback === 'function') {
                            callback(null);
                        }
                        if (result.id) {
                            draftID = result.id;
                        }
                    } else {
                        if (callback && typeof callback === 'function') {
                            callback(result.error);
                        }
                    }
                    previousCategory = category;
                    previousContent = content;
                    previousTitle = title;
                    previousSlug = slug || '';
                },
                error: function (err) {
                    if (callback && typeof callback === 'function') {
                        callback(err);
                    }
                }
            });
        },
        publish: function () {
            var content = $('.editor').val(),
                title = $('.post-head input').val(),
                category = $('option:selected').val();

            if (!content || !title || !category || !slug) {
                Serenader.msgBox('请先完善文章信息。', 'error');
                return false;
            }

            Serenader.progress('正在发表文章...', function (finish) {
                Serenader.updatePost(true, function (err) {
                    if (!err) {
                        finish(function () {
                            Serenader.msgBox('文章发表成功！');
                        });
                    } else {
                        finish(function () {
                            Serenader.msgBox('文章发表失败！' + err, 'error');
                        });
                    }
                });
            });
        },
        saveDraft: function () {
            var content = $('.editor').val(),
                title = $('.post-head input').val(),
                category = $('option:selected').val();

            if (! content || ! title || ! category || ! slug) {
                Serenader.msgBox('请先完善文章信息。', 'error');
                return false;
            }

            Serenader.progress('正在保存草稿...', function (finish) {
                Serenader.updatePost(false, function (err) {
                    if (!err) {
                        finish(function () {
                            Serenader.msgBox('保存草稿成功！');
                        });
                    } else {
                        finish(function () {
                            Serenader.msgBox('保存草稿失败！' + err, 'error');
                        });
                    }
                });
            });
        },
        showHelp: function () {
            Serenader.openDialog({
                title: '编辑器帮助',
                content: $('#help-template').html(),
                task: function () {
                    this.hide();
                }
            });
        },
        generateSlug: function () {
            var value = $(this).val();
            $.ajax({
                url: url.admin + url.adminSlug,
                type: 'POST',
                data: {
                    slug: value
                },
                dataType: 'json',
                success: function (result) {
                    slug = result.slug;
                    $('.post-head input').attr('data-slug', result.slug);
                },
                error: function () {
                    Serenader.msgBox('生成Slug失败！', 'error');
                }
            });
        },
        showPostSetting: function () {
            Serenader.openDialog({
                title: '文章设置',
                content: $('#post-setting-template').html(),
                task: function () {
                    var currentSlug = $('#slug').val();
                    this.hide();
                    slug = currentSlug;
                    $('.post-head input').attr('data-slug', currentSlug);
                },
                rendererData: {
                    slug: $('.post-head input').attr('data-slug')
                }
            });
        }
    });

    $('.categories').lightSelector();
    $('.global-btn').hide();
    Serenader.fire();
    setInterval(function () {
        var content = $('.editor').val(),
            title = $('.post-head input').val(),
            category = $('option:selected').val();

        if (content === previousContent &&
            title === previousTitle &&
            category === previousCategory &&
            slug === previousSlug) {
            return false;
        }

        Serenader.updatePost(false);
    }, 10000);
})();