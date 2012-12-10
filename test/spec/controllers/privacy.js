'use strict';

describe('Controller: PrivacyCtrl', function() {

  // load the controller's module
  beforeEach(module('deadworksApp'));

  var PrivacyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    PrivacyCtrl = $controller('PrivacyCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
