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
  };

  return { restrict: 'A', link: linkFn };
}]);