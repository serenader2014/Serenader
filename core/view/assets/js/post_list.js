/* global Serenader, $, url, moment */

(function () {
    Serenader.addEvents({
        'click|.category-btn': 'showCategory',
        'click|.new-category button': 'addNewCategory',
        'click|body|.edit-category-btn': 'showEditCategory',
        'click|body|.delete-category-btn': 'deleteCategory',
        'click|body|.categories-list a': 'postFilter',
        'click|.new-post-btn': 'openNewPost',
        'click|.post-title a': 'showPreview',
        'click|.close-preview-btn': 'closePreview',
        'click|.edit-post-btn': 'showEditPost'
    });

    Serenader.extend({
        showCategory: function () {
            $('.category-content').toggleClass('show');
        },
        addNewCategory: function () {
            var value = $('.new-category input').val();

            if (!value) {
                Serenader.msgBox('请输入分类名称。', 'error');
                return false;
            }

            Serenader.progress('正在创建新的分类...', function (finish) {
                $.ajax({
                    url: url.api + url.newCategory,
                    type: 'POST',
                    data: {
                        name: value
                    },
                    dataType: 'json',
                    success: function (result) {
                        finish(function () {
                            if (result.ret === 0) {
                                Serenader.msgBox('创建成功！', function () {
                                    var tmpl, regExp, rendererData;
                                    rendererData = {
                                        name: value,
                                        id: result.id
                                    };
                                    tmpl = $('#category-template').html();
                                    for (var i in rendererData) {
                                        if (rendererData[i]) {
                                            regExp = new RegExp('{{' + i + '}}', 'ig');
                                            tmpl = tmpl.replace(regExp, rendererData[i]);
                                        }
                                    }
                                    $('.categories-list').append(tmpl);
                                });
                            } else {
                                Serenader.msgBox('创建失败！' + result.error, 'error');
                            }
                        });
                    },
                    error: function (err) {
                        finish(function () {
                            Serenader.msgBox('创建失败！' + err, 'error');
                        });
                    }
                });
            });
        },
        showEditCategory: function () {
            var targetElement = $(this).parents('li'),
                value = targetElement.attr('data-name'),
                id = targetElement.attr('data-id');
            Serenader.openDialog({
                title: '修改分类名称',
                content: $('#edit-category-template').html(),
                task: function () {
                    var newValue = $('#edit-input').val(),
                        currentDialog = this;
                    if (! newValue) {
                        Serenader.msgBox('分类名为空！', 'error');
                        return false;
                    }
                    Serenader.progress('正在修改分类名称...', function (finish) {
                        $.ajax({
                            url: url.api + url.category + '/' + id,
                            type: 'PUT',
                            data: {
                                name: newValue
                            },
                            dataType: 'json',
                            success: function (result) {
                                finish(function () {
                                    if (result.ret === 0) {
                                        Serenader.msgBox('修改成功！', function () {
                                            var linkElement = targetElement.find('a');
                                            targetElement.attr('data-name', newValue);
                                            linkElement.html(linkElement.html().replace(value, newValue));
                                            currentDialog.hide();
                                        });
                                    } else {
                                        Serenader.msgBox('修改失败！' + result.error, 'error');
                                    }
                                });
                            },
                            error: function (err) {
                                finish(function () {
                                    Serenader.msgBox('修改失败！' + err, 'error');
                                });
                            }
                        });
                    });
                },
                rendererData: {
                    value: value
                }
            });
        },
        deleteCategory: function () {
            var targetElement = $(this).parents('li'),
                id = targetElement.attr('data-id');
            Serenader.msgBox('即将删除该分类。删除前请确保该分类下已经没有文章，否则无法删除。', function () {
                Serenader.progress('正在删除...', function (finish) {
                    $.ajax({
                        url: url.api + url.category + '/' + id,
                        type: 'DELETE',
                        dataType: 'json',
                        success: function (result) {
                            finish(function () {
                                if (result.ret === 0) {
                                    Serenader.msgBox('删除成功！', function () {
                                        targetElement.remove();
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
        },
        postFilter: function () {
            var targetCategory = $(this).parent().attr('data-name'),
                targetPost = [],
                othersPost = [];
            $('.posts-list li').each(function (index, post) {
                var category = $(post).attr('data-category');

                if (category === targetCategory) {
                    targetPost.push(post);
                } else {
                    othersPost.push(post);
                }
            });

            $(this).parent().addClass('active').siblings().removeClass('active');

            $('.posts-list li').show();

            $(othersPost).hide();
        },
        openNewPost: function () {
            window.location = url.admin + url.newPost;
        },
        showPreview: function () {
            var targetElement = $(this).parents('li'),
                id = targetElement.attr('data-id');
            $('.post').hide();
            Serenader.progress('正在获取文章信息...', function (finish) {
                $.ajax({
                    url: url.api + url.post + '/' + id,
                    type: 'GET',
                    dataType: 'json',
                    success: function (result) {
                        finish(function () {
                            $('.post-html').show().attr('data-id', id).find('.container').html(result.html);
                        });
                    },
                    error: function (err) {
                        finish(function () {
                            Serenader.msgBox('获取文章信息失败！', 'error');
                        });
                    }
                });
            });
        },
        closePreview: function () {
            $('.post').show();
            $('.post-html').hide().find('.container').html('');
        },
        showEditPost: function () {
            var id = $('.post-html').attr('data-id');
            window.location = url.admin + url.post + '/' + id;
        }
    });
    $('.post-date').each(function (index, item) {
        var createDate = $(item).attr('data-create'),
            updateDate = $(item).attr('data-update');
            $(item).append(
                $('<span>').html('Created in ' + moment(createDate).format('YYYY/MM/DD'))
                ).append(
                $('<span>').html(', updated in ' + moment(updateDate).fromNow()).addClass('post-update')
                );
    });
    Serenader.fire();
})();