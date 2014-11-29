/* global $, marked, Serenader, hljs, url, window, moment */
(function () {
    var keyMap = {
            ctrl: 17,
            shift: 16,
            alt: 18,
            tab: 9,
            enter: 13,
            b: 66,
            i: 73,
            s: 83,
            p: 80,
            q: 81,
            l: 76,
            k: 75,
            u: 85,
            f11: 122
        },
        regExp = new RegExp(url.newPost, 'ig'),
        draftID = regExp.test(window.location.pathname) ? undefined : window.location.pathname.split('/').pop() ,
        previousTitle = $('.post-head input').val() ,
        previousContent = $('.editor').val() ,
        previousCategory = $('option:selected').val() ,
        previousSlug  = $('.post-head input').attr('data-slug'),
        previousDate = moment($('.post-head input').attr('data-date')).format(),
        slug = previousSlug,
        createDate = previousDate;

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
        'change|.post-head input': 'generateSlug',
        'click|body|.delete-post': 'deletePost'
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
                            editor.selectionStart = start + 1;
                            editor.selectionEnd = start + selection.length + 1;
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
                    editor.selectionStart = start + 2;
                    editor.selectionEnd = start + selection.length + 2;
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
                        editor.selectionStart = start + 1;
                        editor.selectionEnd = start + selection.length + 1;                        
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
                    editor.selectionStart = start + 2;
                    editor.selectionEnd = start + selection.length + 2;
                    break;
                case keyMap.s:
                    if (!event.ctrlKey) {
                        return ;
                    }
                    event.preventDefault();
                    Serenader.saveDraft();
                    break;
                case keyMap.enter:
                    if (!event.ctrlKey || !event.altKey) {
                        return ;
                    }
                    event.preventDefault();
                    Serenader.publish();
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
                url: url.api + url.upload + url.postUpload,
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
                targetUrl = url.api + url.newPost;
                method = 'POST';
            } else {
                targetUrl = url.api + url.post + '/' + draftID;
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
                    slug: slug,
                    createDate: createDate
                },
                dataType: 'json',
                success: function (result) {
                    if (result.ret === 0) {
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
                url: url.api + url.slug,
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
                    var currentSlug = $('#slug').val(),
                        currentDate = moment($('#date').val()).format();
                    this.hide();
                    slug = currentSlug;
                    createDate = currentDate;
                    $('.post-head input').attr('data-slug', currentSlug);
                    $('.post-head input').attr('data-date', currentDate);
                },
                rendererData: {
                    slug: $('.post-head input').attr('data-slug') || ' ',
                    createDate: moment($('.post-head input').attr('data-date')).format('YYYY/MM/DD, HH:mm:ss')
                }
            });
        },
        deletePost: function () {
            if (!draftID) {
                Serenader.msgBox('无法获取该文章的ID。', 'error');
                return false;
            }
            Serenader.msgBox('即将删除该文章。文章删除后无法恢复，请慎重操作！', function () {
                Serenader.progress('正在删除...', function (finish) {
                    $.ajax({
                        url: url.api + url.post + '/' + draftID,
                        type: 'DELETE',
                        dataType: 'json',
                        success: function (result) {
                            finish(function () {
                                if (result.ret === 0) {
                                    Serenader.msgBox('删除成功！', function () {
                                        window.location = url.admin + url.post;
                                    });
                                } else {
                                    Serenader.msgBox('删除失败！' + result.error, 'error');
                                }
                            });
                        },
                        error: function (err) {
                            finish(function () {
                                Serenader.msgBox('删除失败！' + err, 'error');
                            });
                        }
                    });
                });
            });            
        }
    });

    $('.categories').lightSelector();
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