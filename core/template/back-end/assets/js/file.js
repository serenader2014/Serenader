/* global $, window, msg, progress, url, currentUser */
var currentLocation = '/';

function newItem (option) {
    if (option.type === 'folder') {
        var folderTmpl = $($('.folder-template').html());
        folderTmpl.find('.db-filename')
            .html(option.name)
            .data('url', currentLocation + '/' + option.name);
        folderTmpl.find('.create-time').html(option.createTime);
        folderTmpl.find('.last-modified').html(option.lastModifiedTime);
        $('.file-list-wrapper').append(folderTmpl);
    } else if (option.type === 'file') {
        var fileTmpl = $($('.file-template').html()),
            baseLink = '/static/' + currentUser.uid + '/upload/',
            link = currentLocation.split('/')[1] === '' ? 
                '' : currentLocation.split('/').slice(2).join('/');
        fileTmpl.find('.db-filename')
            .html(option.name)
            .attr('href', baseLink + link + option.name)
            .data('url', currentLocation + '/' + option.name);
        fileTmpl.find('.download-btn').attr('href', baseLink + link + option.name).attr('target', '_blank');
        fileTmpl.find('.create-time').html(option.createTime);
        fileTmpl.find('.last-modified').html(option.lastModifiedTime);
        fileTmpl.find('.size').html(option.size);
        $('.file-list-wrapper').append(fileTmpl);
    }
}

function formatSize (num) {
    if (+num > (1024*1024)) {
        return Math.floor(num/(1024*1024)) + ' M';
    } else if (+num > 1024) {
        return Math.floor(num/1024) + ' K';
    } else {
        return num + ' B';
    }
}

function formatTime (str) {
    if (str === 'now') {
        var now = new Date(),
            year = now.getFullYear(),
            month = now.getMonth() + 1 >= 10 ? now.getMonth() + 1 : '0' + now.getMonth() + 1,
            day = now.getDate() >= 10 ? now.getDate() : '0' + now.getDate(),
            hour = now.getHours() >= 10 ? now.getHours() : '0' + now.getHours(),
            minute = now.getMinutes() >= 10 ? now.getMinutes() : '0' + now.getMinutes(),
            second = now.getSeconds() >= 10 ? now.getSeconds() : '0' + now.getSeconds();
        return year + '/' + month + '/' + day + ', ' + hour + ':' + minute + ':' + second;
    } else {
        var d = str.split('T')[0],
            t = str.split('T')[1];
        d = d.replace(/-/ig, '/');
        t = t.split('.')[0];
        return d + ', ' + t;
    }
}

function handle (option) {
    //- option = {
    //-     progressInfo: 'str',
    //-     url: 'str',
    //-     method: 'str',
    //-     data: 'object',
    //-     success: 'function',
    //-     faild: 'function'
    //- }
    progress.show(option.progressInfo, function () {
        $.ajax({
            url: option.url,
            type: option.method,
            data: option.data,
            dataType: 'json',
            success: function (result) {
                progress.hide(function () {
                    option.success(result);
                });
            },
            error: function (err) {
                progress.hide(function () {
                    option.faild(err);
                });
            }
        });
    });
}

function defaultList () {
    var folderTmpl = $($('.folder-template').html()),
       $li = $('<li>'),
       $a = $('<a href="javascript:;">'),
       $span = $('<span>/</span>');
    $('.file-list-wrapper .list-item').remove();
    $('.nav-list li').remove();
    folderTmpl.find('.db-filename').html('Public').data('url', '/public');
    $('.file-list-wrapper').append(folderTmpl);
    folderTmpl = $($('.folder-template').html());
    folderTmpl.find('.db-filename').html('Private').data('url', '/private');
    $('.file-list-wrapper').append(folderTmpl);
    $('.nav-list').append($li.append($a.html('File').data('url', '/')).append($span));
}

function updateFileList (u) {
    handle({
        progressInfo: '正在列出' + u +'路径下的文件...',
        url: url.admin + url.adminFileList,
        data: {
            dir: u,
        },
        method: 'POST',
        success: function (result) {
            if (result.status === 1) {
                var tmp = '';
                currentLocation = u;
                $('.file-list-wrapper .list-item').remove();
                $('.nav-list li').remove();
                currentLocation.split('/').forEach(function (item) {
                    var $li = $('<li>'),
                        $a = $('<a href="javascript:;">'),
                        $span = $('<span>/</span>');
                    if (item === '') {
                        $a.html('File').data('url', '/');
                    } else {
                        tmp = tmp + '/' + item;
                        $a.html(item).data('url', tmp);
                    }
                    $('.nav-list').append($li.append($a).append($span));
                });
                result.folders.forEach(function (folder) {
                    newItem({
                        type: 'folder',
                        name: folder.name,
                        createTime: formatTime(folder.createTime),
                        lastModifiedTime: formatTime(folder.lastModifiedTime)
                    });
                });
                result.files.forEach(function (file) {
                    newItem({
                        type: 'file',
                        name: file.name,
                        createTime: formatTime(file.createTime),
                        lastModifiedTime: formatTime(file.lastModifiedTime),
                        size: formatSize(file.size)
                    });
                });
            } else {
                msg('error', '读取文件夹失败！'+result.error);
            }
        },
        faild: function (err) {
            msg('error', '读取文件夹失败！'+err);
        }
    });
}
if (window.location.hash) {
    currentLocation = window.location.hash.split('#')[1];
    updateFileList(currentLocation);
}
$('.file-list-wrapper').on('click', '.db-filename', function (event) {
    event.preventDefault();
    var targetUrl = $(this).data('url');
    if ($(this).prev().hasClass('fa-folder-open')) {
        $(this).parent().append($('<i>').addClass('fa fa-spin fa-spinner'));
        console.log(targetUrl);
        updateFileList(targetUrl);
    } else {
        window.location = url.admin + url.adminFilePreview +'?path=' + targetUrl;
    }
});

$('.nav-list').on('click', 'a', function (event) {
    event.preventDefault();
    var targetUrl = $(this).data('url');
    if (targetUrl === '/') {
        defaultList();
    } else {
        updateFileList(targetUrl);
    }
});

$('.header-btn').on('click', function () {
    $('.file-nav').toggle();
});

$('.folder-list').on('click', '.checkbox', function () {
    var targetDir = $(this).next().attr('href');
    $('.folder-list .checkbox').find('input[type="checkbox"]').prop('checked', false);
    $('.folder-list .checkbox').find('i').removeClass('fa-check-square-o').addClass('fa-square-o');
    $(this).parents('.modal').find('.target-dir').val(targetDir);
});

$('.modal').on('click', '.file-item', function (event) {
    event.preventDefault();
    var self = this,
        dir = $(self).attr('href');

    $(self).find('.fa-folder').removeClass('fa-folder').addClass('fa-folder-open');
    if ($(self).parent().hasClass('opened')) {
        $(self).parent().removeClass('opened').find('ul').remove();
        $(self).find('.fa-folder-open').removeClass('fa-folder-open').addClass('fa-folder');
    } else {
        $(self).parent().append($('<i>').addClass('fa fa-spin fa-spinner'));
        $.ajax({
            type: 'POST',
            data: {
                dir: dir
            },
            dataType: 'json',
            url: url.admin + url.adminFileList,
            success: function (result) {
                $(self).parent().find('.fa-spin').remove();
                if (result.status === 1) {
                    var $ul = $('<ul>');
                    result.folders.forEach(function (folder) {
                        var $li = $('<li>'),
                            $a = $('<a>').attr('href', dir + '/' + folder.name).addClass('file-item'),
                            $span = $('<span>').html(folder.name),
                            $checkbox = $('<span>').addClass('checkbox')
                                            .append($('<i>').addClass('fa fa-square-o'))
                                            .append($('<input type="checkbox" name="select">')),
                            $i = $('<i>').addClass('fa fa-folder');
                        $ul.append($li.append($checkbox).append($a.append($i).append($span)));
                    });

                    result.files.forEach(function (file) {
                        var $li = $('<li>'),
                            $span = $('<span>').html(file.name),
                            $i = $('<i>').addClass('fa fa-file-o');
                        $ul.append($li.append($span.prepend($i)));
                    });
                    $(self).parent().addClass('opened').append($ul);
                } else {
                    msg('error', 'can not list the folder:' + result.error);
                }
            },
            error: function (err) {
                $(self).parent().find('.fa-spin').remove();
                msg('error', 'can not list the folder:' + err);
            }
        });
    }
});


$('.move, .copy, .delete').on('click', function () {
    var origin = $('tbody input[type="checkbox"]:checked').parents('td'),
        target = origin.clone(true);
    target.find('.checkbox').remove();
    $('.selected-item').find('li').remove();
    target.each(function (index, item) {
        var $li = $('<li>'),
            url = origin.eq(index).find('.db-filename').data('url');
        $li.append($(item).find('i')).append($(item).find('a'));
        $(item).find('.db-filename').data('url', url);
        $('.selected-item').append($li);
    });
});
$('.rename').on('click', function () {
    var target = $('tbody input[type="checkbox"]:checked').parent().siblings('a');
    $('#rename-file .modal-body li').remove();
    target.each(function (index, item) {
        $('#rename-file .modal-body ul')
            .append($('<li>')
                .append($('<span>').html($(item).html()))
                .append($('<input type="text">').val($(item).html())));
    });
});

$('.select-all').on('click', function (event) {
    event.preventDefault();
    var target = $('tbody input[type="checkbox"]');
    target.each(function (index, item) {
        if (! $(item).is(':checked')) {
            $(item).parents('.checkbox').click();
        }
    });
});
$('.select-none').on('click', function (event) {
    event.preventDefault();
    var target = $('tbody input[type="checkbox"]');
    target.each(function (index, item) {
        if ($(item).is(':checked')) {
            $(item).parents('.checkbox').click();
        }
    });
});

$('#rename-file .btn-primary').on('click', function () {
    var file = [];
    $(this).prev().trigger('click');
    $('#rename-file li').each(function (index, li) {
        if ($(li).find('span').html() !== $(li).find('input').val()) {
            file.push({
                path: currentLocation,
                oldName: $(li).find('span').html(),
                newName: $(li).find('input').val()
            });
        }
    });
    if (!file.length) {
        msg('error', '请选择需要重命名的文件！');
        return false;
    }
    handle({
        progressInfo: '正在重命名...',
        method: 'POST',
        url: url.admin + url.adminFileRename,
        data: {
            files: file
        },
        success: function (result) {
            if (result.status === 1) {
                msg('success', '重命名成功！', function () {
                    updateFileList(currentLocation);
                });
            } else if (result.status === -1) {
                var failedFile = '';
                result.files.forEach(function (item) {
                    failedFile = failedFile + item.name + ', ';
                    console.error(item.error);
                });
                msg('warning', '部分文件重命名成功！'+ failedFile +'重命名失败！', function () {
                    updateFileList(currentLocation);
                });
            }
        },
        error: function (err) {
            msg('error', err);
        }
    });
});

$('#move .btn-primary').on('click', function (event) {
    event.preventDefault();
    $(this).prev().trigger('click');
    var target = $('#move .target-dir').val(),
        file = [];
    $('#move .db-filename').each(function (index, a) {
        file.push($(a).data('url'));
    });
    if (! file.length) {
        msg('error', '请选择需要移动的文件或文件夹！');
        return false;
    }
    if (target === '/') {
        msg('error', '请选择目的路径！');
        return false;
    }

    handle({
        progressInfo: '正在移动...',
        method: 'POST',
        url: url.admin + url.adminFileMove,
        data: {
            files: file,
            target: target
        },
        success: function (result) {
            if (result.status === 1) {
                msg('success', '移动成功！', function () {
                    updateFileList(currentLocation);
                });
            } else if (result.status === -1) {
                var failedFile = '';
                result.files.forEach(function (item) {
                    failedFile = failedFile + item.name + ', ';
                    console.error(item.error);
                });
                msg('warning', '部分文件移动成功！'+ failedFile + ' 移动失败！', function () {
                    updateFileList(currentLocation);
                }, 3000);
            } else {
                msg('error', '移动失败！'+ result.error);
            }
        }, 
        faild: function (err) {
            msg('error', '移动失败！' + err);
        }
    });
});

$('#copy .btn-primary').on('click', function (event) {
    event.preventDefault();
    $(this).prev().trigger('click');
    var target = $('#copy .target-dir').val(),
        file = [];
    $('#copy .db-filename').each(function (index, a) {
        file.push($(a).data('url'));
    });
    if (! file.length) {
        msg('error', '请选择需要复制的文件或文件夹！');
        return false;
    }
    if (target === '/') {
        msg('error', '请选择目的路径！');
        return false;
    }

    handle({
        progressInfo: '正在复制...',
        method: 'POST',
        url: url.admin + url.adminFileCopy,
        data: {
            files: file,
            target: target
        },
        success: function (result) {
            if (result.status === 1) {
                msg('success', '复制成功！', function () {
                    updateFileList(currentLocation);
                });
            } else if (result.status === -1) {
                var failedFile = '';
                result.files.forEach(function (item) {
                    failedFile = failedFile + item.name + ', ';
                    console.error(item.error);
                });
                msg('warning', '部分文件复制成功！'+ failedFile + ' 复制失败！', function () {
                    updateFileList(currentLocation);
                }, 3000);
            } else {
                msg('error', '复制失败！'+ result.error);
            }
        }, 
        faild: function (err) {
            msg('error', '复制失败！' + err);
        }
    });
});

$('#delete-file .btn-primary').on('click', function (event) {
    event.preventDefault();
    $(this).prev().trigger('click');
    var target = $('.file-list-wrapper input[type="checkbox"]:checked').parent().siblings('a'),
        files = [];
    if (target.length === 0) {
        msg('error', '没有选中需要删除的文件。');
        return false;
    }
    target.each(function (index, a) {
        files.push($(a).data('url'));
    });
    
    handle({
        progressInfo: '正在删除文件....',
        url: url.admin + url.adminFileDelete,
        method: 'POST',
        data: {
            files: files
        },
        success: function (result) {
            if (result.status === 1) {
                msg('success', '删除成功！', function () {
                    updateFileList(currentLocation);
                });
            } else if (result.status === -1) {
                var failedFile = '';
                result.files.forEach(function (item) {
                    failedFile = failedFile + item.name + ', ';
                    console.error(item.error);
                });
                msg('warning', '部分文件删除成功！'+ failedFile + ' 删除失败！', function () {
                    updateFileList(currentLocation);
                }, 3000);
            } else {
                msg('error', result.error);
            }
        }, 
        faild: function (err) {
            msg('error', err);
        }
    });
});
$('#new .btn-primary').on('click', function (event) {
    event.preventDefault();
    $(this).prev().trigger('click');
    var name = $('#new input[type="text"]').val(),
        type = $('input[type="radio"]:checked').val();
    handle({
        progressInfo: '创建新文件、文件夹中...',
        method: 'POST',
        url: url.admin + url.adminNewFile,
        data: {
            name: name,
            type: type,
            dir: currentLocation
        },
        success: function (result) {
            if (result.status === 1) {
                msg('success', 'Creating new file/folder success!', function () {
                    updateFileList(currentLocation);
                });
            } else {
                msg('error', 'Creating new file/folder error:' + result.error);
            }
        }, 
        faild: function (err) {
            msg('error', 'Creating new file/folder error:' + err);
        }
    });
});
