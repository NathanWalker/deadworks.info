'use strict';

var Deadworks = {
  prop: {
    // to help support offline browsing mode
    clientOnline: true,
    displayableMimeTypes: [ 'image/jpeg', 'image/png', 'image/gif' ],
    interval: {
      fadeMenu: 200,
      fadeMessage: 300,
      fadeInline: 400,
      fadePopup: 600,
      messageDelay: 2500,
      mobileMessageDelay: 4500
    },
    isFullscreen: navigator.hasOwnProperty && navigator.hasOwnProperty('standalone') && navigator.standalone,
    isMobile: false,
    localDevMode: location.hostname.indexOf('deadworks') === -1 && location.protocol !== 'file:',
    localTestMode: location.port == '8080' || location.protocol == 'file:',
    maxThumbnailPreviewSize: 5 * 1024 * 1024, // 5 MB limit for client-side image preview generation
    platform: {
      IS_MOBILE: false,
      IS_ANDROID: false,
      IS_IOS: false,
      IS_IPHONE: false,
      IS_IPAD: false,
      IS_OTHER: false,
      IS_LEGACY_IE: false,
      IS_LEGACY_ANDROID: false,
      IS_LEGACY_IOS: false,
      version: [0]
    },
    version: undefined,
    defaultAvatarImg: undefined,
    authToken: undefined
  },
  uri: {
    host: location.protocol + "//" + location.hostname,
    apiRoot: '/v1/',
    mobileRoot: '/mobile',
    rootDirectory: undefined
  },
  util: {
    detectScreenSize: function(){
      var w, h;
      var screenSize = {};

      if (window){  // window will be undefined when unit testing
        if (Deadworks.prop.isMobile && Deadworks.prop.platform.IS_ANDROID){
          if (Deadworks.prop.platform.IS_LEGACY_ANDROID){
            w = document.width;
            h = document.height;
          }
          if (w === undefined || h === undefined){
            // fallback
            w = $(window).outerWidth(true);
            h = $(window).outerHeight(true);
          }
        } else {
          w = $(window).outerWidth(true);
          h = $(window).outerHeight(true);
        }
      } else {
        w = 0;
        h = 0;
      }

      screenSize.height = h;
      screenSize.width = w;

      return screenSize;
    },
    disableTouchMove: function(e){
      if (e){
        e.preventDefault();
      }
    },
    // if a scroll is attempted when not needed, iScroll4 would jump awkwardly without this call
    iScrollToElement: function(scrollInstance, scrollToTarget, duration){
      if (scrollInstance.wrapperH < scrollInstance.scrollerH){
        scrollInstance.scrollToElement(scrollToTarget, duration || 0);
      }
    },
    // used to determine if a mime type is a supported image type
    isImageType: function(type){
      return type.search(/image\/(gif|jpeg|png|tiff)/) > -1;
    },
    // parses string version numbers
    parseVersion: function(version, splitChar){
      splitChar = splitChar || '.';

      return (typeof version === 'string' && version.length > 0) ? version.split(splitChar) : [0];
    },
    // used for formatting selections within select2 controls
    select2FormatSelection: function(obj){
      var $el = angular.element(obj.element);
      return '<span data-selection-type="' + $el.data('selection-type') + '">' + obj.text + '</span>';
    },
    setupCardVideo: function(targetSelectorContext, callback){
      // First off, get page context where we want to find any cards that need video setup
      var $pageContext;

      if (targetSelectorContext !== undefined){
        $pageContext = angular.element(targetSelectorContext);
      } else {
        $pageContext = angular.element('body');
      }

      var $cardsWithVjs = $pageContext.find('.video-js');
      $cardsWithVjs.each(function(){
        if (angular.element(this).hasClass('video-youtube')){
          _V_(angular.element(this).attr('id'), {techOrder: ["youtube", "html5"], ytcontrols: true, controls: false});
        } else if (angular.element(this).hasClass('video-vimeo')){
          _V_(angular.element(this).attr('id'), {techOrder: ["vimeo", "html5"]});
        } else {
          _V_(angular.element(this).attr('id')).ready(function(){
            if (callback){
              callback();
            }
          });
        }
      });
    },
    stopCardVideo: function(targetSelectorContext){
      var $pageContext;

      if (targetSelectorContext !== undefined){
        $pageContext = angular.element(targetSelectorContext);
      } else {
        $pageContext = angular.element('body');
      }

      var $cardsWithVjs = $pageContext.find('div.video-js.vjs-playing');
      $cardsWithVjs.each(function(){
        // Stop videos found using .pause() after a reference through _V_ is ready to control playback
        _V_(angular.element(this).attr('id')).ready(function(){
          this.pause();
        });
      });
    },
    // strips out all HTML from strings, primarily for counting genuine string length
    stripHTML: function(html){
      return (html || '').replace(/<\/?[a-z][a-z0-9]*[^<>]*>/ig, '');
    },
    toggleSpinner: function(targetSelector, on, options){
      if (window){  // window will be undefined when unit testing
        if (on && angular.element(targetSelector + ' .spinjs').length === 0){
          $(targetSelector).spin(_.extend({className: 'spinjs', color: '#fff'}, options)); // merge options with defaults
        } else if (on === false){
          /*! kill spinner */
          $(targetSelector).spin(false);
        }
      }
    }
  }
};
// these reference other properties of Deadworks.* so they must be set individually
Deadworks.prop.usingMobileSite = window.location.pathname.indexOf(Deadworks.uri.mobileRoot) > -1;
Deadworks.prop.usingFullSite = window.location.pathname.indexOf(Deadworks.uri.mobileRoot) == -1;
Deadworks.uri.server = Deadworks.uri.host + (Deadworks.prop.localDevMode ? ':3501' : '');
Deadworks.uri.apiServer = Deadworks.uri.server + Deadworks.uri.apiRoot;

var devLog = function(msg){
  if (Deadworks.prop.localDevMode){
    console.log(msg);
  }
};

/**
 * Device detection and setup - useful on mobile *and* full site
 */
(function(){
  var ua = navigator.userAgent.toLowerCase();
  var newSettings = {};

  if (ua.match(/android/i)){
    newSettings = {
      IS_MOBILE: true,
      IS_ANDROID: true,
      name: 'android',
      version: Deadworks.util.parseVersion(ua.match(/android ([\d\.]+)/)[1], '.'),
      scrollTop: 1,
      addressBarHeight: 57,
      prevOrientation: window.orientation
    };
  } else if (ua.match(/ipad/i)){
    newSettings = {
      IS_MOBILE: true,
      IS_IOS: true,
      IS_IPAD: true,
      name: 'ipad',
      version: Deadworks.util.parseVersion(ua.match(/cpu os ([\d_]+)/)[1], '_'),
      scrollTop: 0,
      addressBarHeight: Deadworks.prop.isFullscreen ? 0 : 60
    };
  } else if (ua.match(/iphone|ipod/i)){ // defaults
    newSettings = {
      IS_MOBILE: true,
      IS_IOS: true,
      IS_IPHONE: true,
      name: 'iphone',
      version: Deadworks.util.parseVersion(ua.match(/cpu iphone os ([\d_]+)/)[1], '_'),
      scrollTop: 0,
      addressBarHeight: Deadworks.prop.isFullscreen ? 0 : 60
    };
  } else if (ua.match(/mobile|blackBerry|iemobile|kindle|netfront|silk-accelerated|(hpw|web)os|fennec|minimo|opera m(obi|ini)|blazer|dolfin|dolphin|skyfire|zune|windows\sce|palm/i)){
    newSettings = {
      IS_MOBILE: true,
      IS_OTHER: true,
      name: 'mobile-generic',
      scrollTop: 0,
      addressBarHeight: 0
    };
  } else {
    newSettings = {
      IS_OTHER: true,
      name: 'desktop-browser'
    };
  }

  // summary settings based on combinations of other conditions
  newSettings.IS_LEGACY_IE = $.browser.msie && parseInt($.browser.version, 10) < 10;
  newSettings.IS_LEGACY_ANDROID = newSettings.IS_ANDROID && newSettings.version[0] < 4;
  newSettings.IS_LEGACY_IOS = newSettings.IS_IOS && newSettings.version[0] < 6;

  _.extend(Deadworks.prop.platform, newSettings);
}());

simpleCart.bind('load', function(){
  console.log("simpleCart has loaded " + simpleCart.quantity() + " items from from localStorage");
});

var setupSimpleCart = function(type, scope, $compile){
  if(type=='home'){

    $('.cartInfo').show();
    $('#cartPopover').remove();
    var cartTemplate = '<div id="cartPopover"><div id = "triangle" >▲</div>' +
      '<div class="simpleCart_items"></div>' +
      '<div id="cartData" class="clearfix">'     +
        '<div class="left">'    +
          '<strong>Items: </strong>' +
          '<span class="simpleCart_quantity">0</span>'  +
        '</div>'   +
        '<div class="right">' +
          '<strong>Total: </strong>'  +
          '<span class="simpleCart_total"></span>'     +
        '</div>'   +
      '</div>'    +
      '<div id="popoverButtons" class="clearfix">'   +
        '<a ng-click="changeRoute(\'/cart\')" class="hudbtn left">View</a>' +
        '<a href="javascript:;" class="simpleCart_checkout hudbtn primary right">Checkout</a>'   +
      '</div>' +
    '</div>';

    var $cartTemplate = angular.element(cartTemplate);
    $compile($cartTemplate)(scope);
    angular.element('body').append($cartTemplate);

    simpleCart({
      //Setting the Cart Columns for the sidebar cart display.
      cartColumns: [
        //A custom cart column for putting the quantity and increment and decrement items in one div for easier styling.
        { view: function(item, column){
          return  "<span>" + item.get('quantity') + "</span>" + "<div>" + "<a href='javascript:;' class='simpleCart_increment'><img src='/images/increment.png' title='+1' alt='arrow up'/></a>" + "<a href='javascript:;' class='simpleCart_decrement'><img src='/images/decrement.png' title='-1' alt='arrow down'/></a>" + "</div>";
        }, attr: 'custom' },
        //Name of the item
        { attr: "name", label: false },
        //Subtotal of that row (quantity of that item * the price)
        { view: 'currency', attr: "total", label: false  }
      ],
      cartStyle: 'div',
      checkout: {
        type: "PayPal",
        email: "thetaalpha970@gmail.com"
      }
    });

    setTimeout(function(){
      // ensure items are added
      simpleCart.load();
    }, 200);

  } else {
    $('.cartInfo').hide();
    $('#cartPopover').remove();
    simpleCart({
      //Setting the Cart Columns for the sidebar cart display.
      cartColumns: [
        //Name of the item
        { attr: "name", label: "Name" },
        //Quantity displayed as an input
        { attr: "quantity", label: "Quantity", view: "input"},
        //Built in view for a remove link
        { view: 'remove', text: "Remove", label: false},
        //Price of item
        { attr: "price", label: "Price"},
        //Subtotal of that row (quantity of that item * the price)
        { attr: "total", label: "Subtotal", view: "currency"  }
      ],
      cartStyle: "table",
      checkout: {
        type: "PayPal",
        email: "thetaalpha970@gmail.com"
      }
    });

    setTimeout(function(){
      // ensure items are added
      simpleCart.load();
    }, 200);
  }
};

var DeadworksApp = angular.module('DeadworksApp', ['ngResource', 'ngSanitize']).config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider){
  if (Deadworks.prop.platform.IS_LEGACY_ANDROID || Deadworks.prop.platform.IS_LEGACY_IE){
    // FULL SITE DOES NOT NEED HTML5 History API support because we don't use $routeProvider
    // CRITICAL for proper old IE and Android 2.3.3 / 2.3.4 support
    // Angular docs state setting html5Mode(true) *should* degrade gracefully if browser doesn't support html5 history
    // but it does NOT! ... must set this *explicitly* to false in order to work properly
    $locationProvider.html5Mode(false);
  } else {
    $locationProvider.html5Mode(true);
  }

  $routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainCtrl'
    }).when('/merch', {
      templateUrl: 'views/merch.html',
      controller: 'MerchCtrl'
    }).when('/contact', {
      templateUrl: 'views/contact.html',
      controller: 'ContactCtrl'
    }).when('/privacy', {
      templateUrl: 'views/privacy.html',
      controller: 'PrivacyCtrl'
    }).when('/terms', {
      templateUrl: 'views/terms.html',
      controller: 'TermsCtrl'
    }).when('/cart', {
      templateUrl: 'views/cart.html',
      controller: 'CartCtrl'
    }).otherwise({
      redirectTo: '/'
    });
}]);
