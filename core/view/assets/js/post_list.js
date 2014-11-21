/* global Serenader, $, url */

(function () {
    Serenader.addEvents({
        'click|.category-btn': 'showCategory',
        'click|.new-category button': 'addNewCategory',
        'click|body|.edit-category-btn': 'showEditCategory',
        'click|body|.delete-category-btn': 'deleteCategory',
        'click|body|.categories-list a': 'postFilter',
        'click|.post-action button': 'deletePost'
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
                    url: url.admin + url.adminNewCategory,
                    type: 'POST',
                    data: {
                        name: value
                    },
                    dataType: 'json',
                    success: function (result) {
                        finish(function () {
                            if (result.status === 1) {
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
                            url: url.admin + url.adminCategory + '/' + id,
                            type: 'PUT',
                            data: {
                                name: newValue
                            },
                            dataType: 'json',
                            success: function (result) {
                                finish(function () {
                                    if (result.status === 1) {
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
                        url: url.admin + url.adminCategory + '/' + id,
                        type: 'DELETE',
                        dataType: 'json',
                        success: function (result) {
                            finish(function () {
                                if (result.status === 1) {
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
        deletePost: function () {
            var targetElement = $(this).parents('li'),
                id = targetElement.attr('data-id'),
                category = targetElement.attr('data-category');
            Serenader.msgBox('即将删除该文章。文章删除后无法恢复，请慎重操作！', function () {
                Serenader.progress('正在删除...', function (finish) {
                    $.ajax({
                        url: url.admin + url.adminPost + '/' + id,
                        type: 'DELETE',
                        dataType: 'json',
                        success: function (result) {
                            finish(function () {
                                if (result.status === 1) {
                                    Serenader.msgBox('删除成功！', function () {
                                        targetElement.remove();
                                        $('.categories-list li').each(function (index, c) {
                                            var currentCategory = $(c).attr('data-name');
                                            if (category === currentCategory) {
                                                var countElement = $(c).find('.category-count'),
                                                    count = countElement.html().replace(/[( ][ )]/ig, '')*1 - 1;
                                                countElement.html('( ' + count + ' )');
                                            }
                                        });
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

    Serenader.fire();
})();