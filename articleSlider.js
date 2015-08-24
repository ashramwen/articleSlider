'use strict';
angular.module('ag.service', []).directive('articleSlide', ['$timeout', '$interval', function($timeout, $interval) {
    var _maxHeight = 216;
    var _top = 0;

    /**
     * detect if imgs are loaded or not
     * @param  {[type]} imgs [description]
     * @return {[type]}      [description]
     */
    function detectImgLoad(imgs) {
        if (imgs.length == 0)
            return true;
        for (var i = 0; i < imgs.length; i++) {
            if (!imgs[i].complete)
                return false;
        }
        return true;
    }

    /**
     * get child outer height
     * @param  {[type]} child [description]
     * @return {[type]}       [description]
     */
    function getHeight(child, _margin) {
        if (_margin == undefined) _margin = true;
        if (child.tagName == 'A' && $(child).data('lightbox'))
            return $(child).find('img').outerHeight(_margin);
        return $(child).outerHeight(_margin);
    }

    /**
     * article and media slide by calculate children height
     * @param  {[type]} scope [description]
     * @param  {[type]} elem  [description]
     * @return {[type]}       [description]
     */
    function articleSlideDetect2(scope, elem) {
        if (scope.longContent) return;
        var content = elem.find('.html');
        if (content[0].offsetHeight >= content[0].scrollHeight) {
            if (detectImgLoad(content.find('img'))) {
                scope.longContent = -1;
            }
            return;
        }
        var children = content.children();
        if (!children) {
            scope.longContent = -1;
            return;
        }
        var firstH = getHeight(children[0]);
        if (children.length == 1) {
            scope.longContent = -1;
            content.css('max-height', firstH + 'px');
            return;
        }
        scope.longContent = firstH;
        for (var i = 1; i < children.length; i++) {
            if (!$(children[i]).html()) continue;
            var childH = getHeight(children[i]);
            if ((scope.longContent + childH) > _maxHeight) {
                scope.longContent -= getHeight(children[i - 1]);
                scope.longContent += getHeight(children[i - 1], false);
                break;
            }
            scope.longContent += childH;
        }
        content.css('max-height', scope.longContent + 'px');
    }

    /**
     * article and media slide by calculate offset top
     * @param  {[type]} scope [description]
     * @param  {[type]} elem  [description]
     * @return {[type]}       [description]
     */
    function articleSlideDetect(scope, elem) {
        if (scope.mid == 32650) {
            // console.log('32650');
        }
        if (scope.longContent && scope.imgLoaded) return;
        var content = elem.find('.html');
        if (!scope.imgLoaded)
            scope.imgLoaded = detectImgLoad(content.find('img'));
        if (content[0].offsetHeight >= content[0].scrollHeight) {
            if (scope.imgLoaded) {
                scope.longContent = -1;
            }
            return;
        }
        var children = content.children();
        if (!children) {
            scope.longContent = -1;
            return;
        }
        var firstH = $(children[0]).height();
        if (children.length == 1) {
            scope.longContent = -1;
            content.css('max-height', firstH + 'px');
            return;
        }
        _top = content.offset().top;
        scope.longContent = firstH;
        for (var i = 1; i < children.length; i++) {
            var _h = $(children[i]).offset().top + children[i].offsetHeight - _top;
            if (_h > _maxHeight) break;
            scope.longContent = _h;
        }
        content.css('max-height', scope.longContent + 'px');
    }

    /**
     * post message slide
     * @param  {[type]} scope [description]
     * @param  {[type]} elem  [description]
     * @return {[type]}       [description]
     */
    function slideDetect(scope, elem) {
        if (scope.longContent) return;
        var content = elem.find('.html');
        if (content[0].offsetHeight >= content[0].scrollHeight) {
            scope.longContent = -1;
        } else {
            scope.longContent = _maxHeight;
        }
    }

    return {
        restrict: 'A',
        scope: {
            longContent: '=messageSlide',
            type: '=messageType',
            imgLoaded: '=messageImg',
            mid: '=messageId'
        },
        link: function(scope, elem, ctrl) {
            $timeout(function() {
                switch (scope.type) {
                    case 2:
                    case 5:
                        articleSlideDetect(scope, elem);
                        elem.find('.html img').each(function() {
                            if (!this.complete) {
                                $(this).one("load", function() {
                                    articleSlideDetect(scope, elem);
                                });
                            }
                        });
                        break;
                    default:
                        slideDetect(scope, elem);
                        break;
                }
            }, 0);
        }
    }
}])
