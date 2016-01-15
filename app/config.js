'use strict';
(function() {
  var config = angular.module('config', []);

  config.factory('config', function() {
    return {
      restAPI: 'https://localhost:5000'
    };
  });

})();
