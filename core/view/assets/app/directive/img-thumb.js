(function () {
    angular.module('appModule')
    .directive('imgThumb', ['$window', function ($window) {
        var helper = {
            isFile: function (item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function (item) {
                return /^.*\.(jpg|png|jpeg|bmp|gif)$/i.test(item.name);
            }
        };

        return {
            restrict: 'AE',
            template: '<canvas></canvas>',
            link: function ($scope, $elem, $attrs) {
                var options = $scope.$eval($attrs.imgThumb),
                    canvas = $elem.find('canvas'),
                    readerOnLoad,
                    imgOnLoad,
                    Reader = new FileReader();

                if (!options.file) {
                    return false;
                }

                if (!helper.isFile(options.file)) {
                    return false;
                }

                if (!helper.isImage(options.file)) {
                    return false;
                }
                imgOnLoad = function () {
                    var width = options.width || this.width / this.height * options.height,
                        height = options.height || this.height / this.width * options.width;

                    canvas.attr({width: width, height: height});
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                };

                readerOnLoad = function (event) {
                    var img = new Image();
                    img.onload = imgOnLoad;
                    img.src = event.target.result;
                };
                Reader.onload = readerOnLoad;
                Reader.readAsDataURL(options.file);
            }
        };
    }]);
})();