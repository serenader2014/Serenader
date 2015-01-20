/* global marked, hljs, moment */

(function () {
    angular.module('serenader',[
        'ngRoute',
        'ngResource',
        'ngSanitize',
        'appModule',
        'angularFileUpload'
        ])
    .filter('ellipsis', [function () {
        return function (text, length) {
            if (!text) {
                return text;
            }
            if (text.length < length) {
                return text;
            } else {
                return text.substring(0, length) + '...';
            }
        };
    }])
    .controller('appController', ['$scope', '$rootScope',
        function ($scope, $rootScope) {
            $scope.url = url;
            $scope.assets = assets;
            $scope.isUserProfileShown = false;
            if ($(window).width() < 720) {
                $rootScope.isMobile = true;
            }

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

            $(window).on('click touchstart', function (event) {
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
    .controller('postController', ['$scope', '$rootScope', '$location', 'Category', 'Post', 'User',
        function ($scope, $rootScope, $location, Category, Post, User){
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
                            post.lastModifiedDate = moment(post.lastModifiedDate).fromNow();
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
                $scope.$watch('posts', function (p) {
                    if (p.length) {
                        angular.forEach($scope.categories, function (c) {
                            angular.forEach($scope.posts, function (p) {
                                if (p.category === c._id) {
                                    p.category = c;
                                }
                            });
                        });
                    }
                }, true);
                $scope.$watch('drafts', function (d) {
                    if (d.length) {
                        angular.forEach($scope.categories, function (c) {
                            angular.forEach($scope.drafts, function (d) {
                                if (d.category === c._id) {
                                    d.category = c;
                                }
                            });
                        });
                    }
                }, true);
            });
            $scope.currentCate = '';
            $scope.showPost = function (c) {
                if ($scope.currentCate) {
                    return c._id === $scope.currentCate;
                } else {
                    return true;
                }
            };
            $scope.switchCategory = function (category) {
                if ($scope.currentCate === category._id) {
                    $scope.currentCate = '';
                } else {
                    $scope.currentCate = category._id;
                }
            };
            $scope.postPreview = function (post) {
                $scope.isPostPreview = true;
                $scope.currentPost = post;
                $scope.postHtml = $(post.html).html();
            };
            $scope.editPost = function () {
                $location.path(url.post + '/' + $scope.currentPost._id);
            };
            $scope.isCategoryShown = true;

            if ($rootScope.isMobile) {
                $scope.isCategoryShown = false;
            }
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
    .controller('newPostController', ['$scope', '$rootScope', 'Category', 'Post', 'Slug', 'FileUploader', '$interval', '$location',
        function ($scope, $rootScope, Category, Post, Slug, FileUploader, $interval, $location) {
            $rootScope.title = '新文章';
            $scope.post = {};
            fileUploader($scope, FileUploader);
            $scope.post.createDate = moment().format('YYYY/MM/DD, HH:mm:ss');
            $scope.fullscreen = false;
            post($scope, $interval, $location, Slug, Category, Post);
            editor($scope);
        }
    ])
    .controller('editPostController', ['$scope', '$rootScope', '$routeParams', '$interval', '$location', 'Post', 'Category', 'Slug', 'FileUploader',
        function ($scope, $rootScope, $routeParams, $interval, $location, Post, Category, Slug, FileUploader) {
            $rootScope.title = '编辑文章';
            $scope.test = {
                slug: 'somet'
            };
            Post.common.get({id: $routeParams.id}, function (response) {
                if (response._id) {
                    $rootScope.post =
                    $scope.post = response;
                    $scope.post.id = $routeParams.id;
                    $scope.post.content = response.markdown;
                    $scope.post.tags = $scope.post.tags.join(',');
                    $scope.post.createDate = moment($scope.post.createDate).format('YYYY/MM/DD, HH:mm:ss');
                    post($scope, $interval, $location, Slug, Category, Post);
                } else {
                    $scope.fetchPostError = true;
                    $scope.redirectToList = function () {
                        $location.path(url.post);
                    };
                }
            }, function () {
                $scope.fetchPostError = true;
                $scope.redirectToList = function () {
                    $location.path(url.post);
                };
            });
            fileUploader($scope, FileUploader);
            editor($scope);
        }
    ])
    .controller('insertImgController', ['$scope',
        function ($scope) {
            $scope.$watch('imgUrl', function (value) {
                $scope.$parent.$parent.imgUrl = value;
            });
        }
    ])
    .controller('galleryController', ['$scope', '$rootScope', 'Gallery', 'Slug',
        function ($scope, $rootScope, Gallery, Slug) {
            $rootScope.title = '相册';
            Gallery.common.getAll(function (response) {
                $scope.albums = response;
            });
            $scope.$watch('albums', function (albums) {
                if (albums) {
                    $scope.albums.forEach(function (album) {
                        if (album.cover === '/default_album.png') {
                            album.cover = assets.server + '/default_album.png';
                        }
                    });
                }
            }, true);
            $scope.createNewAlbum = function () {
                Gallery.common.new({
                     name: $scope.newAlbum.name,
                     desc: $scope.newAlbum.desc,
                     private: $scope.newAlbum.private || false,
                     slug: $scope.newAlbum.slug || ''
                }, function (response) {
                    if (response.ret === 0) {
                        $scope.newAlbumStatus = 0;
                        $scope.message = '创建相册成功！';
                        $scope.albums.push(response.album);
                    } else {
                        $scope.newAlbumStatus = -1;
                        $scope.message = '创建相册失败！' + response.error;
                    }
                }, function (err) {
                    $scope.newAlbumStatus = -1;
                    $scope.message = err;
                });
            };
            $scope.newAlbum = {};
            $scope.$watch('newAlbum.name', function (value) {
                if (value) {
                    Slug.generate({}, {
                        slug: value,
                    }, function (response) {
                        $scope.newAlbum.slug = response.slug;
                    });
                }
            });
            $scope.delete = function (album) {
                $scope.currentAlbum = album;
                $scope.confirmDelete = true;
            };
            $scope.deleteAlbum = function () {
                $scope.confirmDelete = false;
                if (!$scope.currentAlbum) {
                    return false;
                }
                Gallery.common.delete({id: $scope.currentAlbum._id}, function (response) {
                    if (response.ret === 0) {
                        $scope.deleteStatus = 0;
                        $scope.message = '删除相册成功！';
                        $scope.albums.splice($scope.albums.indexOf($scope.currentAlbum), 1);
                    } else {
                        $scope.deleteStatus = -1;
                        $scope.message = '删除相册失败！' + response.error;
                    }

                }, function (err) {
                    $scope.deleteStatus = -1;
                    $scope.message = '删除相册失败！' + err;
                });
            };
        }
    ])
    .controller('albumController', [
        '$scope',
        '$rootScope',
        '$routeParams',
        '$location',
        '$q',
        'FileUploader',
        'Gallery',
        'deleteImg',
        function ($scope, $rootScope, $routeParams, $location, $q, FileUploader, Gallery, deleteImg) {
            var uploader = $scope.uploader = new FileUploader();
            $scope.isSideShown = true;
            if ($rootScope.isMobile) {
                $scope.showMenu = false;
                $scope.isSideShown = false;
            }
            Gallery.common.get({id: $routeParams.id}, function (data) {
                $scope.album = data;
                if ($scope.album.cover === '/default_album.png') {
                    $scope.album.cover = assets.server + '/default_album.png';
                }
                $rootScope.title = '相册：' + (data.name.length > 8 ? data.name.substring(0, 8) + '...' : data.name);
                uploader.url = url.api + url.gallery + '/' + $scope.album.slug;
            }, function (err) {
                console.log(err);
            });
            $scope.reSelect = function () {
                uploader.clearQueue();
                $('#file-input').val('');
                $scope.isAdded = $scope.isUploading = $scope.isFinished = false;
            };

            $scope.deleteFailed = [];

            $scope.deleteImg = function () {
                var targetImg = [],
                    deferred = $q.defer();
                deferred.resolve();
                angular.forEach($scope.album.images, function (image) {
                    if (image.isSelected) {
                        targetImg.push(image);
                    }
                });
                targetImg.reduce(function (promise, img) {
                    return promise.then(function () {
                        return deleteImg(img._id, $scope.album.slug).then(function (data) {
                            if (data.data.ret === 0) {
                                $scope.album.images.splice($scope.album.images.indexOf(img), 1);
                            } else {
                                $scope.deleteFailed.push({
                                    image: $scope.album.images[img.index],
                                    message: data.data.error
                                });
                            }
                        });
                    });
                }, deferred.promise).catch(function (err) {
                    console.error(err);
                });
            };
            $scope.settingCover = false;
            $scope.showSetCover = function (image) {
                $scope.settingCover = true;
                $scope.cover = image.path;
            };
            $scope.setCover = function () {
                $scope.settingCover = false;
                Gallery.common.update({
                    id: $scope.album._id
                },{
                    name: $scope.album.name,
                    description: $scope.album.desc,
                    slug: $scope.album.slug,
                    cover: $scope.cover,
                    private: $scope.album.private
                }, function (response) {
                    if (response.ret === 0) {
                        $scope.setCoverStatus = 0;
                        $scope.message = '设置相册封面成功！';
                        $scope.album.cover = $scope.cover;
                    } else {
                        $scope.setCoverStatus = -1;
                        $scope.message = response.error;
                    }
                }, function (err) {
                    $scope.setCoverStatus = -1;
                    $scope.message = err;
                });
            };
            $scope.lightbox = function (item, index, event) {
                event.preventDefault();
                if ($scope.inSelectMode) {
                    item.isSelected = !item.isSelected;
                } else {
                    blueimp.Gallery($('.image a'), {
                        index: index + 1
                    });
                }
            };

            uploader.onAfterAddingFile = function (item) {
                item.onComplete = function (response, status) {
                    if (status === 200) {
                        angular.forEach(response[0], function (img) {
                            if (typeof img === 'object') {
                                $scope.album.images.push(img);
                            }
                        });
                    }
                };
                $scope.isAdded = true;
            };

            uploader.onProgressAll = function () {
                $scope.isUploading = true;
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
            $scope.selectAll = function () {
                angular.forEach($scope.album.images, function (img) {
                    img.isSelected = true;
                });
            };
            $scope.reverseSelect = function () {
                angular.forEach($scope.album.images, function (img) {
                    img.isSelected = !img.isSelected;
                });
            };
            $scope.showDelete = function () {
                $scope.confirmDelete = true;
            };
            $scope.deleteAlbum = function () {
                $scope.confirmDelete = false;
                Gallery.common.delete({id: $scope.album._id}, function (response) {
                    if (response.ret === 0) {
                        $scope.deleteStatus = 0;
                        $scope.message = '删除相册成功！';
                    } else {
                        $scope.deleteStatus = -1;
                        $scope.message = '删除相册失败！' + response.error;
                    }
                }, function (err) {
                    $scope.deleteStatus = -1;
                    $scope.message = '删除相册失败！' + err;
                });
            };
            $scope.redirect = function () {
                $location.path(url.gallery);
            };
            $scope.editAlbum = function () {
                $scope.showEditAlbum = false;
                Gallery.common.update({
                    id: $scope.album.id
                },{
                    name: $scope.album.name,
                    description: $scope.album.desc,
                    slug: $scope.album.slug,
                    cover: $scope.album.cover,
                    private: $scope.album.private
                }, function (response) {
                    if (response.ret === 0) {
                        $scope.editAlbumStatus = 0;
                        $scope.message = '修改相册信息成功！';
                    } else {
                        $scope.editAlbumStatus = -1;
                        $scope.message = response.error;
                    }
                }, function (err) {
                    $scope.editAlbumStatus = -1;
                    $scope.message = err;
                });
            };
        }
    ])
    .controller('fileController', ['$scope', '$rootScope',
        function ($scope, $rootScope) {
            $rootScope.title = '文件管理';
        }
    ])
    .controller('settingController', ['$scope', '$rootScope',
        function ($scope, $rootScope) {
            $rootScope.title = '设置';
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
        .when(url.gallery + '/:id', {
            templateUrl: assets.server + '/views/album.html',
            controller: 'albumController'
        })
        .when(url.file, {
            templateUrl: assets.server + '/views/file.html',
            controller: 'fileController',
        })
        .when(url.setting, {
            templateUrl: assets.server + '/views/setting.html',
            controller: 'settingController',
        })
        .when(url.newPost, {
            templateUrl: assets.server + '/views/post.html',
            controller: 'newPostController'
        })
        .when(url.post + '/:id', {
            templateUrl: assets.server + '/views/post.html',
            controller: 'editPostController'
        })
        .otherwise({
            redirectTo: '/'
        });
    }]);
    function editor ($scope) {
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
        marked.setOptions({
            highlight: function (code) {
                return hljs.highlightAuto(code).value;
            }
        });
        $scope.insert = function () {
            if ($scope.post) {
                $scope.showInsertImg = false;
                var editor = $('.editor textarea'),
                    value = $scope.post.content || '',
                    start = editor.get(0).selectionStart,
                    end = editor.get(0).selectionEnd,
                    str = '![image](' + ($scope.imgUrl || '') + ')';
                $scope.post.content = value.substring(0, start) + str + value.substring(end);
                editor.focus();
                editor.get(0).selectionStart = start + 2;
                editor.get(0).selectionEnd = start + 7;
            }
        };
        $scope.renderMarkdown = function (value) {
            $scope.markdownPreview = marked(value);
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
    function fileUploader ($scope, FileUploader) {
        var uploader = $scope.uploader = new FileUploader({
            url: url.api + url.upload + url.postUpload
        });
        $scope.isUrlTabShown = true;
        $scope.isUploadTabShown = !$scope.isUrlTabShown;
        $scope.switchTab = function (tab) {
            if (tab === 'url') {
                $scope.isUrlTabShown = true;
                $scope.isUploadTabShown = !$scope.isUrlTabShown;
            } else {
                $scope.isUrlTabShown = false;
                $scope.isUploadTabShown = !$scope.isUrlTabShown;
            }
        };

        $scope.reSelect = function (item) {
            if (item.isUploading) {
                item.cancel();
            }
            uploader.clearQueue();
            $('#file-input').val('');
            $scope.isAdded = $scope.isUploading = $scope.isFinished = false;
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
    }
    function post ($scope, $interval, $location, Slug, Category, Post) {
        Category.getAll(function (data) {
            $scope.categories = data;
        });
        $scope.showDelete = false;
        $scope.showDeletePost = function () {
            $scope.showDelete = true;
        };
        $scope.deletePost = function () {
            if (!$scope.post.id) {
                $scope.deleteStatus = -1;
                $scope.message = '找不到该文章！请确保该文章已经存为草稿或者已经发表！';
                return false;
            } else {
                Post.common.delete({id: $scope.post.id}, function (response) {
                    if (response.ret === 0) {
                        $scope.deleteStatus = 0;
                        $scope.message = '删除成功！';
                    } else {
                        $scope.deleteStatus = -1;
                        $scope.message = response.error;
                    }
                }, function () {
                    $scope.deleteStatus = -1;
                    $scope.message = '删除失败！网络错误！';
                });
            }
        };
        $scope.returnToPostList = function () {
            $location.path(url.post);
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
        $scope.$watch('post.title', function (value) {
            if (value) {
                Slug.generate({}, {
                    slug: value,
                }, function (response) {
                    $scope.post.slug = response.slug;
                });
            }
        });

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
    }
})();