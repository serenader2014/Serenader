angular.module('serenader').directive('ripple', function () {
    return {
        controller: ['$scope', '$element', '$attrs', function (scope, elem, attrs) {
            elem.addClass('ripple');
            var ink = elem.find('.ink');
            if (attrs.ripple !== 'ripple') {
                var color = attrs.ripple;
                elem.addClass('ripple-' + color);
            }
            elem.on('click', function (event) {
                ink.removeClass('animate');

                var offsetLeft = elem.offset().left;
                var offsetTop = elem.offset().top;
                var width = elem[0].offsetWidth;
                var height = elem[0].offsetHeight;
                var inkWidth = Math.max(width, height);
                var x = event.pageX - offsetLeft - inkWidth/2;
                var y = event.pageY - offsetTop - inkWidth/2;
                ink.css({width: inkWidth, height: inkWidth, top: y, left: x});
                ink.addClass('animate');
            });
        }],
        transclude: true,
        template: '<span class="ink"></span><span ng-transclude></span>'
    };
});