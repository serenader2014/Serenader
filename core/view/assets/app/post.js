/* global marked, hljs, moment*/

(function () {
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
                var editor          = $('.editor textarea');
                var value           = $scope.post.content || '';
                var start           = editor.get(0).selectionStart;
                var end             = editor.get(0).selectionEnd;
                var str             = '![image](' + ($scope.imgUrl || '') + ')';
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
    function fileUploader ($scope, upload) {
        var uploader = upload({
            url: url.api + url.upload + url.postUpload,
            addFile: function (item) {
                item.onComplete = function (response, status) {
                    if (status === 200) {
                        $scope.imgUrl = response.data[0].url;
                    }
                };
                $scope.isAdded = true;
            },
            progressAll: function () {
                $scope.isUploading = true;
            },
            completeAll: function () {
                $scope.isFinished = true;
            },
            cancel: function () {
                $scope.isUploading = false;
            },
            error: function (item, response, status) {
                $scope.isFinished = true;
                $scope.isError = true;
                $scope.errorItem = {
                    item: item,
                    code: status
                };
            }
        });
        $scope.uploader = uploader;
        $scope.isUrlTabShown = true;
        $scope.isUploadTabShown = !$scope.isUrlTabShown;
        $scope.cancelWarning = false;
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

        $scope.warning = function () {
            $scope.cancelWarning = true;
        };

        $scope.cancelUpload = function (item) {
            item.cancel();
            $scope.cancelWarning = false;
        };
    }
    function post ($scope, $interval, $location, Slug, Category, Post) {
        Category.getAll(function (response) {
            if (response.ret !== 0) {
                $scope.getCategoryError = true;
                return false;
            }
            $scope.categories = response.data;
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
                Post.delete({id: $scope.post.id}, function (response) {
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
                Post.update({
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
                Post.new({}, {
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
                    if (response.ret !== 0) {
                        $scope.getSlugError = true;
                        return false;
                    }
                    $scope.post.slug = response.data;
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
                        $scope.post.id = response.data.id;
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
    angular.module('serenader').controller('postController', ['$scope', '$rootScope', '$location', 'Category', 'Post', 'userStatus',
        function ($scope, $rootScope, $location, Category, Post, userStatus){

            if (!userStatus()) {
                return false;
            }

            var count = 1;
            $rootScope.title = '文章';
            $scope.allPosts = [];
            $scope.posts = [];
            $scope.drafts = [];
            function parsePosts (posts) {
                $scope.posts = [];
                $scope.drafts = [];
                angular.forEach(posts, function (post) {
                    post.createDate = moment(post.createDate).format('YYYY/MM/DD');
                    post.lastModifiedDate = moment(post.lastModifiedDate).fromNow();
                    if (post.published) {
                        $scope.posts.push(post);
                    } else {
                        $scope.drafts.push(post);
                    }
                });
            }
            function getPosts (user, page) {
                Post.get({user: user.uid, page: page, amount: 10, category: $scope.currentCate}, function (response) {
                    if (response.ret !== 0) {
                        $scope.getPostError = true;
                        return false;
                    }
                    $scope.allPosts = $scope.allPosts.concat(response.data.data);
                    parsePosts($scope.allPosts);
                    if (10 * count < response.data.total) {
                        $scope.showLoadMore = true;
                    } else {
                        $scope.showLoadMore = false;
                    }
                }, function () {
                    $scope.getPostError = true;
                });
            }
            $scope.loadMore = function () {
                count = count + 1;
                getPosts($rootScope.currentUser.uid, count);
            };
            $scope.goToNewPost = function () {
                $location.path(url.newPost);
            };

            getPosts($rootScope.currentUser.uid, count);

            Category.getAll(function (response) {
                if (response.ret !== 0) {
                    $scope.getCategoryError = true;
                    return false;
                }
                $scope.categories = response.data;
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
            }, function () {
                $scope.getCategoryError = true;
                return false;
            });
            $scope.currentCate = undefined;
            $scope.switchCategory = function (category) {
                if ($scope.currentCate === category._id) {
                    $scope.currentCate = undefined;
                } else {
                    $scope.currentCate = category._id;
                }
                $scope.allPosts = [];
                count = 1;
                getPosts($rootScope.currentUser.uid, count);
            };
            $scope.postPreview = function (post) {
                $scope.isPostPreview = true;
                $scope.currentPost = post;
                $scope.postHtml = post.html;
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
    ]).controller('newPostController', [
        '$scope',
        '$rootScope',
        '$interval',
        '$location',
        'Category',
        'Post',
        'Slug',
        'Upload',
        'userStatus',
        function ($scope, $rootScope, $interval, $location, Category, Post, Slug, upload, userStatus) {
            if (!userStatus()) {
                return false;
            }
            $rootScope.title = '新文章';
            $scope.post = {};
            fileUploader($scope, upload);
            $scope.post.createDate = moment().format('YYYY/MM/DD, HH:mm:ss');
            $scope.fullscreen = false;
            post($scope, $interval, $location, Slug, Category, Post);
            editor($scope);
        }
    ]).controller('editPostController', [
        '$scope',
        '$rootScope',
        '$routeParams',
        '$interval',
        '$location',
        'Post',
        'Category',
        'Slug',
        'Upload',
        function ($scope, $rootScope, $routeParams, $interval, $location, Post, Category, Slug, upload) {
            $scope.outer = {};
            $rootScope.title = '编辑文章';
            Post.get({id: $routeParams.id}, function (response) {
                if (response.ret === 0) {
                    $scope.post = response.data;
                    $scope.outer = $scope.post;
                    $scope.slug = response.data.slug;
                    $scope.post.id = $routeParams.id;
                    $scope.post.content = response.data.markdown;
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
            fileUploader($scope, upload);
            editor($scope);
        }
    ]).controller('insertImgController', ['$scope',
        function ($scope) {
            $scope.$watch('imgUrl', function (value) {
                $scope.$parent.$parent.imgUrl = value;
            });
        }
    ]);
})();