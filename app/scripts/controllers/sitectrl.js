'use strict';

DeadworksApp.controller('SiteCtrl', ['$scope', '$location', 'GlobalService', function(s, $location, global){
  s.global = global;
  s.isHome = $location.path() == '/';
  s.currentRoute = s.isHome ? '/' : $location.path();
  s.musicPlaying = true;

  s.headerLinks = [
    {label: 'Music', link: '/', active:true, useCarousel:true},
    {label: 'Merch', link: '/merch', active: false, useCarousel: false},
    {label: 'Contact', link: '/contact', active: false, useCarousel: false}
  ];

  s.changeRoute = function(route){
    if(route !== undefined){
      devLog('change route: ' + route);

      $location.path(route);
      s.currentRoute = route;
      s.isHome = route == '/';
      _.forEach(s.headerLinks, function(l){
        l.active = l.link == route;
      });
      s.toggleMenu(false);
    }
  };

  s.toggleMenu = function(force){
    if(force !== undefined){
      // force state
      s.global.menuEnabled(force);
    } else {
      // toggle state
      s.global.menuEnabled(!s.global.menuEnabled());
    }

  };

  s.showMsg = function(msg){
    s.global.alertMsg(msg);
  };

  s.carouselActive = function(){
    var activeRoute = _.find(s.headerLinks, function(l){
      return l.link == $location.path();
    });

    return activeRoute ? activeRoute.useCarousel : false;
  };
}]);
