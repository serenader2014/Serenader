/* global _, blueimp */
angular.module('serenader').controller('galleryController', ['$scope', '$rootScope', 'Gallery', 'Slug', 'userStatus',
    function ($scope, $rootScope, Gallery, Slug, userStatus) {

        if (!userStatus()) {
            return false;
        }

        $rootScope.title = '相册';
        Gallery.user.get({
            name: $rootScope.currentUser.uid
        }, function (response) {
            if (response.ret !== 0) {
                $scope.getGalleryError = true;
                return false;
            }
            $scope.albums = response.data;
        }, function (err) {
            console.error(err);
            $scope.getGalleryError = true;
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
                    $scope.albums.push(response.data);
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
                    if (response.ret !== 0) {
                        $scope.getSlugError = true;
                        return false;
                    }
                    $scope.newAlbum.slug = response.data;
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
]).controller('albumController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$location',
    '$q',
    'Gallery',
    'deleteImg',
    'userStatus',
    function ($scope, $rootScope, $routeParams, $location, $q, Gallery, deleteImg, userStatus) {
        if (!userStatus()) {
            return false;
        }

        $scope.isSideShown = true;
        $scope.outer = {};
        $scope.deleteFailed = [];
        $scope.settingCover = false;

        if ($rootScope.isMobile) {
            $scope.showMenu = false;
            $scope.isSideShown = false;
        }

        Gallery.common.get({id: $routeParams.id}, function (response) {
            if (response.ret !== 0) {
                $scope.getGalleryError = true;
                $scope.message = response.error;
                return false;
            }
            $scope.album = response.data;
            $scope.outer.album = response.data;
            console.log($scope.outer.album);
            if ($scope.album.cover === '/default_album.png') {
                $scope.album.cover = assets.server + '/default_album.png';
            }
            $rootScope.title = '相册：' + ($scope.album.name.length > 8 ? $scope.album.name.substring(0, 8) + '...' : $scope.album.name);
            $scope.uploadUrl = url.api + url.gallery + '/' + $scope.album.slug;
        }, function (err) {
            $scope.getGalleryError = true;
            $scope.message = err;
            console.log(err);
        });

        $scope.redirectToGallery = function () {
            $location.path(url.gallery);
        };

        $scope.completeOne = function (response) {
            angular.forEach(response.data[0], function (img) {
                if (typeof img === 'object') {
                    $scope.album.images.push(img);
                }
            });
        };

        $scope.deleteImg = function () {
            var targetImg = _.filter($scope.album.images, 'isSelected'),
                idList = _.pluck(targetImg, '_id'),
                deferred = $q.defer();
            deferred.resolve();
            _.reduce(idList, function (promise, id) {
                return promise.then(function () {
                    return deleteImg(id, $scope.album.slug).then(function (response) {
                        if (response.data.ret === 0) {
                            _.remove($scope.album.images, function (img) {
                                return img._id === id;
                            });
                        }
                    });
                });
            }, deferred.promise).catch(function (err) {
                console.error(err);
            });
        };
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
                desc: $scope.album.desc,
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
                id: $scope.album._id
            },{
                name: $scope.album.name,
                desc: $scope.album.desc,
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
]);