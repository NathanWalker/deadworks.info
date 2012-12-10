'use strict';

describe('Controller: MerchCtrl', function() {

  // load the controller's module
  beforeEach(module('deadworksApp'));

  var MerchCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    MerchCtrl = $controller('MerchCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
