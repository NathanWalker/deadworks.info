DeadworksApp.directive('dwMenu', ['$compile', function($compile){
  var linkFn = function(scope, element, attrs){
    scope.$watch('global.menuEnabled()', function(val){
      angular.element('#tweet').hide();
      if(val){
        element.css('height', '175px');
      } else {
        element.css('height', '0px');
      }
    });

    scope.$watch('currentRoute', function(val){
      devLog('currentRoute change');
      devLog(val);
      if(val != '/'){
        $('#note-to-play').hide();
        angular.element('#tweet').hide();
        if(val=='/cart'){
          // ensure cart page is filled with items
          setupSimpleCart('cart', scope, $compile);
        } else {
          setupSimpleCart('home', scope, $compile);
        }
      } else {
        $('#note-to-play').show();
        setupSimpleCart('home', scope, $compile);
      }
    });

    scope.$watch('musicPlaying', function(val){
      var $btn = angular.element('#music-control .pause-btn');
      var $audio = angular.element('#audio');

      if(activeMusicAnimation){
        if (val){
          $btn.removeClass('paused');
          $audio.get(0).play();
          activeMusicAnimation(true);
        } else {
          $btn.addClass('paused');
          $audio.get(0).pause();
          activeMusicAnimation(false);
        }
      }

    });
  };

  return { restrict: 'A', link: linkFn };
}]);