/* global marked, hljs, moment */

(function () {
    angular.module('serenader',[
        'ngRoute',
        'ngResource',
        'appModule',
        'angularFileUpload'
        ])
    .controller('appController', ['$scope',
        function ($scope) {
            $scope.url = url;
            $scope.assets = assets;
            $scope.isUserProfileShown = false;

            $scope.toggleUserProfile = function () {
                $scope.isUserProfileShown = !$scope.isUserProfileShown;
            };


            $scope.isSideMenuShown = false;

            $scope.toggleSideMenu = function () {
                if ($(window).width() > 720) {
                    return false;
                }
                $scope.isSideMenuShown = !$scope.isSideMenuShown;
            };

            $(window).on('click', function (event) {
                var target = event.target;

                if ($(target).parents('.sub-menu').length === 0 &&
                    $(target).parents('.user-avatar').length === 0) {
                    $scope.isUserProfileShown = false;
                }

                if ($(target).parents('.side-menu').length === 0 &&
                    $(target).parents('.side-menu-btn').length === 0) {
                    $scope.isSideMenuShown = false;
                }
                $scope.$digest();
            });
        }
    ])
    .controller('dashboardController', ['$scope', '$rootScope',
        function ($scope, $rootScope) {
            $rootScope.title = '控制面板';
        }
    ])
    .controller('postController', ['$scope', '$rootScope', '$location', 'Category', 'Post', 'User', '$sce',
        function ($scope, $rootScope, $location, Category, Post, User, $sce){
            User.current(function (response) {
                $rootScope.user = response;
            });
            $rootScope.title = '文章';
            $scope.posts = [];
            $scope.drafts = [];
            $scope.goToNewPost = function () {
                $location.path(url.newPost);
            };
            $rootScope.$watch('user', function (user) {
                if (user) {
                    Post.user.get({name: user.uid}, function (response) {
                        angular.forEach(response, function (post) {
                            post.createDate = moment(post.createDate).format('YYYY/MM/DD');
                            post.lastModifiedDate = moment(post.lastModifiedDate).format('YYYY/MM/DD');
                            if (post.published) {
                                $scope.posts.push(post);
                            } else {
                                $scope.drafts.push(post);
                            }
                        });
                    }, function () {
                        $scope.getPostError = true;
                    });
                }
            }, true);

            Category.getAll(function (response) {
                $scope.categories = response;
            });
            $scope.postPreview = function (post) {
                $scope.isPostPreview = true;
                $scope.currentPost = post;
                $scope.postHtml = $sce.trustAsHtml($(post.html).html());
            };
            $scope.editPost = function () {
                $location.path(url.post + '/' + $scope.currentPost._id);
            };
            $scope.isCategoryShown = false;
            $scope.toggleCategory = function () {
                if ($(window).width() > 720) {
                    return false;
                }

                $scope.isCategoryShown = !$scope.isCategoryShown;
            };
            $scope.tmp = {category: ''};
            $scope.showEditCategory = function (c) {
                $scope.isEditCategory = true;
                $scope.currentCategory = c;
                $scope.tmp.category = c.name;
            };
            $scope.showDeleteCategory = function (c) {
                $scope.isDeleteCategory = true;
                $scope.currentCategory = c;
            };
            $scope.editCategory = function () {
                $scope.isEditCategory = false;
                Category.update({id: $scope.currentCategory._id}, {name: $scope.tmp.category}, function (response) {
                    if (response.ret === 0) {
                        $scope.success = true;
                        $scope.message = '修改分类名成功！';
                        $scope.currentCategory.name = $scope.tmp.category;
                    } else {
                        $scope.error = true;
                        $scope.message = response.error;
                    }
                }, function () {
                    $scope.error = true;
                    $scope.message = '请求修改分类失败！网络错误！';
                });
            };
            $scope.deleteCategory = function () {
                $scope.isDeleteCategory = false;
                Category.delete({id: $scope.currentCategory._id}, {}, function (response) {
                    console.log(response);
                    if (response.ret === 0) {
                        $scope.success = true;
                        $scope.message = '删除分类成功！';
                        $scope.categories.splice($scope.categories.indexOf($scope.currentCategory), 1);
                    } else {
                        $scope.error = true;
                        $scope.message = response.error;
                    }
                }, function () {
                    $scope.error = true;
                    $scope.message = '请求删除分类失败！网络错误！';
                });
            };
            $scope.newCategory = function () {
                Category.new({name: $scope.newCategoryName}, function (response) {
                    if (response.ret === 0) {
                        $scope.success = true;
                        $scope.message = '添加新的分类成功！';
                        $scope.categories.push({
                            name: $scope.newCategoryName,
                            _id: response.id,
                            count: 0
                        });
                    } else {
                        $scope.error = true;
                        $scope.message = response.error;
                    }
                }, function () {
                    $scope.error = true;
                    $scope.message = '添加新的分类失败！网络错误！';
                });
            };
        }
    ])
    .controller('newPostController', ['$scope', '$rootScope', 'Category', 'Post', 'Slug', 'FileUploader', '$interval', '$sce',
        function ($scope, $rootScope, cate, Post, Slug, FileUploader, $interval, $sce) {
            var uploader = $scope.uploader = new FileUploader({
                url: url.api + url.upload + url.postUpload
            });
            $rootScope.title = '新文章';
            $scope.categories = cate.getAll();
            $scope.post = {};
            $scope.isUrlTabShown = true;
            $scope.isUploadTabShown = !$scope.isUrlTabShown;
            marked.setOptions({
                highlight: function (code) {
                    return hljs.highlightAuto(code).value;
                }
            });

            $scope.insert = function () {
                $scope.showInsertImg = false;
                var editor = $('.editor'),
                    value = $scope.post.content || '',
                    start = editor.get(0).selectionStart,
                    end = editor.get(0).selectionEnd,
                    str = '![image](' + ($scope.imgUrl || '') + ')';
                $scope.post.content = value.substring(0, start) + str + value.substring(end);
                editor.focus();
                editor.get(0).selectionStart = start + 2;
                editor.get(0).selectionEnd = start + 7;
            };

            $scope.switchTab = function (tab) {
                if (tab === 'url') {
                    $scope.isUrlTabShown = true;
                    $scope.isUploadTabShown = !$scope.isUrlTabShown;
                } else {
                    $scope.isUrlTabShown = false;
                    $scope.isUploadTabShown = !$scope.isUrlTabShown;
                }
            };

            uploader.onAfterAddingFile = function (item) {
                item.onComplete = function (response, status) {
                    if (status === 200) {
                        $scope.imgUrl = response[0].url;
                    }
                };
                $scope.isAdded = true;
            };

            uploader.onProgressAll = function () {
                $scope.isUploading = true;
            };

            $scope.cancelWarning = false;
            $scope.warning = function () {
                $scope.cancelWarning = true;
            };

            $scope.cancelUpload = function (item) {
                item.cancel();
                $scope.cancelWarning = false;
            };

            uploader.onCompleteAll = function () {
                $scope.isFinished = true;
            };

            uploader.onCancelItem = function () {
                $scope.isUploading = false;
            };

            uploader.onErrorItem = function (item, response, status) {
                $scope.isFinished = true;
                $scope.isError = true;
                $scope.errorItem = {
                    item: item,
                    code: status
                };
            };

            $scope.reSelect = function (item) {
                if (item.isUploading) {
                    item.cancel();
                }
                uploader.clearQueue();
                $('#file-input').val('');
                $scope.isAdded = $scope.isUploading = $scope.isFinished = false;
            };


            $scope.$watch('post.title', function (value) {
                if (value) {
                    Slug.generate({}, {
                        slug: value,
                    }, function (response) {
                        $scope.post.slug = response.slug;
                    });
                }
            });
            $scope.post.createDate = moment().format('YYYY/MM/DD, HH:mm:ss');
            $scope.fullscreen = false;

            var oldPostContent = $scope.post.content,
                oldPostTitle = $scope.post.title,
                oldPostSlug = $scope.post.slug,
                oldPostCate = $scope.post.category;
            $interval(function () {
                if (oldPostCate === $scope.post.category &&
                    oldPostSlug === $scope.post.slug &&
                    oldPostTitle === $scope.post.title &&
                    oldPostContent === $scope.post.content) {
                    return false;
                } else {
                    newPost(false, function (err, response) {
                        if (err) {
                            console.warn('Auto update post failed! ' + err.error || '网络错误！');
                            return false;
                        } else {
                            $scope.post.id = response.id;
                            console.info('Auto update post success, post id is ' + $scope.post.id);
                        }
                    });
                }
                oldPostContent = $scope.post.content;
                oldPostTitle = $scope.post.title;
                oldPostSlug = $scope.post.slug;
                oldPostCate = $scope.post.category;
            }, 10000);

            $scope.saveDraft = function () {
                newPost(false, function (err) {
                    if (err) {
                        $scope.draftStatus = -1;
                        $scope.message = err.error || '网络错误！';
                    } else {
                        $scope.draftStatus = 0;
                        $scope.message = '保存草稿成功！';
                        oldPostContent = $scope.post.content;
                        oldPostTitle = $scope.post.title;
                        oldPostSlug = $scope.post.slug;
                        oldPostCate = $scope.post.category;
                    }
                });
            };

            $scope.publishPost = function () {
                newPost(true, function (err) {
                    if (err) {
                        $scope.publishStatus = -1;
                        $scope.message = err.error || '网络错误！';
                    } else {
                        $scope.publishStatus = 0;
                        $scope.message = '发表文章成功！';
                        oldPostContent = $scope.post.content;
                        oldPostTitle = $scope.post.title;
                        oldPostSlug = $scope.post.slug;
                        oldPostCate = $scope.post.category;
                    }
                });
            };

            var newPost = function (publish, callback) {
                if ($scope.post.id) {
                    Post.common.update({
                        id: $scope.post.id
                    }, {
                        content: $scope.post.content,
                        title: $scope.post.title,
                        tags: $scope.post.tags ? $scope.post.tags.split(',') : [],
                        category: $scope.post.category,
                        publish: publish,
                        slug: $scope.post.slug,
                        createDate: moment($scope.post.createDate).format()
                    }, function (response) {
                        if (response.ret === 0) {
                            callback(undefined, response);
                        } else {
                            callback(response);
                        }
                    }, function (err) {
                        callback(err);
                    });
                } else {
                    Post.common.new({}, {
                        content: $scope.post.content,
                        title: $scope.post.title,
                        tags: $scope.post.tags ? $scope.post.tags.split(',') : [],
                        category: $scope.post.category,
                        publish: publish,
                        slug: $scope.post.slug,
                        createDate: moment($scope.post.createDate).format()
                    }, function (response) {
                        if (response.ret === 0) {
                            callback(undefined, response);
                        } else {
                            callback(response);
                        }
                    }, function (err) {
                        callback(err);
                    });
                }
            };
            $scope.renderMarkdown = function (value) {
                $scope.markdownPreview = $sce.trustAsHtml(marked(value));
            };

            $scope.mobilePreview = false;
            $scope.renderMobilePreview = function () {
                $scope.mobilePreview = !$scope.mobilePreview;
                if ($scope.mobilePreview) {
                    $scope.renderMarkdown($scope.post.content);
                }
            };

            if ($(window).width() > 720) {
                $scope.$watch('post.content', function (value) {
                    if (value) {
                        $scope.renderMarkdown(value);
                    }
                });
            }
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
                f11: 122,
                f1: 112,
            };
            $('.editor textarea').on('keydown', function (event) {
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
                                $scope.showInsertImg = true;
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
                        $scope.fullscreen = !$scope.fullscreen;
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
                        $scope.saveDraft();
                        break;
                    case keyMap.enter:
                        if (!event.ctrlKey || !event.altKey) {
                            return ;
                        }
                        event.preventDefault();
                        $scope.publishPost();
                        break;
                    case keyMap.f1:
                        event.preventDefault();
                        $scope.showHelp = true;
                        break;
                }
                var val = $(this).val();
                $scope.$apply(function () {
                    $scope.post.content = val;
                });
            });
        }
    ])
    .controller('insertImgController', ['$scope',
        function ($scope) {
            $scope.$watch('imgUrl', function (value) {
                $scope.$parent.$parent.imgUrl = value;
            });
        }
    ])
    .controller('galleryController', ['$scope', '$rootScope',
        function ($rootScope) {

        }
    ])
    .controller('fileController', ['$scope', '$rootScope',
        function ($rootScope) {

        }
    ])
    .controller('settingController', ['$scope', '$rootScope',
        function ($rootScope) {

        }
    ])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: assets.server + '/views/dashboard.html',
            controller: 'dashboardController'
        })
        .when(url.post, {
            templateUrl: assets.server + '/views/post_list.html',
            controller: 'postController',
        })
        .when(url.gallery, {
            templateUrl: assets.server + '/views/gallery.html',
            controller: 'galleryController',
        })
        .when(url.file, {
            templateUrl: assets.server + '/views/file.html',
            controller: 'fileController',
        })
        .when(url.setting, {
            templateUrl: assets.server + '/views/settnig.html',
            controller: 'settingController',
        })
        .when(url.newPost, {
            templateUrl: assets.server + '/views/post.html',
            controller: 'newPostController'
        })
        .otherwise({
            redirectTo: '/'
        });
    }]);
})();