angular.module('serenader').directive('fileUploader', function () {
    return {
        restrict: 'E',
        templateUrl: assets.server + '/app/template/upload.html',
        scope: {
            url: '=',
            complete: '&',
            completeAll: '&',
            error: '&',
            type: '=',
            showUpload: '=show'
        },
        controller: ['$scope', 'FileUploader', function ($scope, FileUploader) {
            var uploader = $scope.uploader = new FileUploader(),
                callback = {
                complete: function (item, response) {
                    $scope.complete({response: response});
                },
                progressAll: function () {
                    $scope.isUploading = true;
                },
                completeAll: function () {
                    $scope.isFinished = true;
                    $scope.completeAll();
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
                    $scope.error();
                }
            };
        $scope.$watch('url', function (value) {
            if (value) {
                uploader.url = value;
            }
        });
        uploader.onErrorItem = callback.error;
        uploader.onCancelItem = callback.cancel;
        uploader.onProgressAll = callback.progressAll;
        uploader.onCompleteAll = callback.completeAll;
        uploader.onCompleteItem = callback.complete;
        $scope.cancelUpload = function (item) {
            item.cancel();
            $scope.cancelWarning = false;
        };
        $scope.reSelect = function () {
            uploader.clearQueue();
            $('#file-input').val('');
            $scope.isAdded = $scope.isUploading = $scope.isFinished = false;
        };
        }]
    };
});
