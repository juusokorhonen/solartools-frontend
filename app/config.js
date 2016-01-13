'use strict';
(function() {
  var config = angular.module('config', []);

  config.factory('config', function() {
    return {
      restAPI: 'https://tranquil-wildwood-8965.herokuapp.com'
    };
  });

})();
