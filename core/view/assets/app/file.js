/* global moment, _, ace, blueimp */
angular.module('serenader').controller('fileController', ['$scope', '$rootScope', '$location', '$q', '$window', 'File',
    function ($scope, $rootScope, $location, $q, $window, File) {
        $rootScope.title = '文件管理';
        $scope.moment = moment;
        $scope.currentPath = $location.search().path;
        $scope.type = $location.search().type;
        $scope.$watch('currentPath', function (path) {
            if (path) {
                File.getDir($scope.currentPath, $scope.type).success(function (data) {
                    if (data.ret === 0) {
                        $scope.lists = [];
                        angular.forEach(data.data.folders, function (folder) {
                            folder.type = 0;
                            folder.createTime = moment(folder.createTime).format('YYYY/MM/DD, HH:mm');
                            folder.href = '#/files?path=/' + $scope.nav().join('/') + '/' + folder.name + '/';
                            folder.lastModifiedTime = moment(folder.lastModifiedTime).format('YYYY/MM/DD, HH:mm');
                            folder.deleteUrl = path + folder.name;
                            $scope.lists.push(folder);
                        });
                        angular.forEach(data.data.files, function (file) {
                            file.type = 1;
                            file.createTime = moment(file.createTime).format('YYYY/MM/DD, HH:mm');
                            file.href = '';
                            file.deleteUrl = path + file.name;
                            file.lastModifiedTime = moment(file.lastModifiedTime).format('YYYY/MM/DD, HH:mm');
                            $scope.lists.push(file);
                        });
                    }
                });
                $scope.uploadUrl = url.api + url.upload + path.substring(0, path.length - 1);
            } else {
                $scope.lists = [{
                    name: 'public',
                    href: '#/files?path=/public/',
                    type: 0,
                    createTime: moment().format('YYYY/MM/DD, HH:mm'),
                    lastModifiedTime: moment().format('YYYY/MM/DD, HH:mm')
                },{
                    name: 'private',
                    href: '#/files?path=/private/',
                    type: 0,
                    createTime: moment().format('YYYY/MM/DD, HH:mm'),
                    lastModifiedTime: moment().format('YYYY/MM/DD, HH:mm')
                }];
            }
        });
        $scope.completeOne = function (response) {
            var file = response.data[0];
            $scope.lists.push({
                name: file.name,
                href: '',
                size: file.size,
                type: 1,
                createTime: moment().format('YYYY/MM/DD, HH:mm'),
                lastModifiedTime: moment().format('YYYY/MM/DD, HH:mm')
            });
        };
        $scope.nav = function () {
            if (!$scope.currentPath) {
                return [];
            }
            var arr = [];
            angular.forEach($scope.currentPath.split('/'), function (fragment) {
                if (fragment) {
                    arr.push(fragment);
                }
            });
            return arr;
        };
        function getCodeLang (extName) {
            switch (extName) {
                case 'html': return 'html';
                case 'css': return 'css';
                case 'scss': return 'scss';
                case 'js': return 'javascript';
                case 'md': return 'markdown';
                case 'py': return 'python';
                case 'php': return 'php';
                default: return '';
            }
        }
        $scope.showPreview = function (event, file) {
            if ($scope.showDelete) {
                event.preventDefault();
                file.checked = !file.checked;
                return false;
            }
            if (file.type === 1) {
                event.preventDefault();
                var imgRegExp = /jpg|jpeg|png|gif|bmp/ig,
                    codeFileRegExp = /html|scss|css|js|md|py|php/ig,
                    extName = _.last(file.name.split('.'));
                if (imgRegExp.test(extName)) {
                    var urlPrefix = assets.static + '/' + $rootScope.user.uid + '/upload/',
                        tmpArr = $scope.currentPath.split('/'),
                        imgUrl = urlPrefix + _.drop(_.compact(tmpArr)).join('/') + '/' + file.name;
                    blueimp.Gallery([imgUrl]);
                }
                if (codeFileRegExp.test(extName)) {
                    var codeLang = getCodeLang(extName);
                    $location.path(url.filePreview)
                        .search('path', $scope.currentPath + file.name)
                        .search('lang', codeLang);
                }
            }
        };
        $scope.rename = {
            show: false,
            target: undefined,
            name: '',
            submit: function () {
                var _this = this;
                File.move($scope.currentPath + _this.target.name, $scope.currentPath + _this.name).then(function (response) {
                    if (response.data.ret === 0) {
                        _this.show = false;
                        _this.target.name = _this.name;
                        _this.name = '';
                    }
                }, function (err) {
                    console.log(err);
                });
            },
            showDialog: function (file) {
                this.show = true;
                this.target = file;
            }
        };
        $scope.selectAll = function () {
            _.forEach($scope.lists, function (file) {
                file.checked = true;
            });
        };
        $scope.reverseSelect = function () {
            _.forEach($scope.lists, function (file) {
                file.checked = !file.checked;
            });
        };
        $scope.deleteFile = function () {
            var arr = _.pluck(_.filter($scope.lists, 'checked'), 'deleteUrl'),
                deferred = $q.defer();

            deferred.resolve();
            _.reduce(arr, function (promise, file) {
                return promise.then(function () {
                    return File.delete(file).then(function (response) {
                        if (response.data.ret === 0) {
                            _.remove($scope.lists, function (f) {
                                return f.deleteUrl === file;
                            });
                        } else {
                            console.error(response.data.error);
                        }
                    });
                });
            }, deferred.promise);
        };
        $scope.new = {
            name: '',
            type: '',
            show: false,
            create: function () {
                var _this = this;
                _this.showNewFile = false;
                File.newFile({
                    type: _this.type,
                    dir: $scope.currentPath,
                    name: _this.name
                }).success(function (response) {
                    if (response.ret === 0) {
                        $scope.lists.push({
                            name: _this.name,
                            href: _this.type === 'folder' ? '#/files?path=' + $scope.currentPath + _this.name : '',
                            type: _this.type === 'folder' ? 0 : 1,
                            createTime: moment().format('YYYY/MM/DD, HH:mm'),
                            lastModifiedTime: moment().format('YYYY/MM/DD, HH:mm')
                        });
                        _this.name = '';
                    } else {
                    }
                }).error(function (err) {
                });
            }
        };
        $scope.downloadFile = function (file) {
            if (file.type === 0) {
                return '';
            }
            var path = _.drop(_.compact($scope.currentPath.split('/'))).join('/');
            return assets.static + '/' + $rootScope.user.uid + '/upload/' + path + '/' + file.name;
        };
    }
]).controller('previewController', ['$scope', '$rootScope', '$location', '$window', 'File',
    function ($scope, $rootScope, $location, $window, File) {
        var targetPath = _.drop(_.compact($location.search().path.split('/'))).join('/'),
            targetUrl = assets.static + '/' + $rootScope.user.uid + '/upload',
            lang = $location.search().lang,
            editor;
        $scope.editor = {};
        $rootScope.title = '文件预览';
        File.getContent(targetUrl + '/' + targetPath).then(function (response) {
            $scope.editor.readOnly = true;
            editor = ace.edit('editor');
            editor.setValue(response.data);
            editor.clearSelection();
            editor.setFontSize(14);
            editor.setTheme('ace/theme/tomorrow');
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });
            editor.commands.addCommands([{
                name: 'nextline',
                bindKey: {win: 'Ctrl-Enter'},
                exec: function (editor) {
                    editor.navigateLineEnd();
                    editor.insert('\n');
                }
            },{

            }]);
            editor.getSession().setMode('ace/mode/' + lang);
            editor.setAutoScrollEditorIntoView(true);
            $scope.$watch('editor.readOnly', function (value) {
                if (value !== undefined) {
                    editor.setReadOnly(value);
                }
            });
        });

        $scope.back = function () {
            var path = '/' + _.dropRight(_.compact($location.search().path.split('/'))).join('/') + '/';
            $location.path(url.file).search('path', path);
        };
        $scope.openRawFile = function () {
            $window.location.pathname = targetUrl + '/' + targetPath;
        };
        $scope.saveEdit = function () {
            File.saveEdit(editor.getValue(), $location.search().path).then(function (response) {
                if (response.data.ret === 0) {
                    $scope.editStatus = 0;
                    $scope.message = '编辑成功！';
                } else {
                    $scope.editStatus = -1;
                    $scope.message = '编辑失败！' + response.data.error;
                }
            }, function () {
                $scope.editStatus = -1;
                $scope.message = '编辑失败！网络错误！';
            });
        };
    }
]);