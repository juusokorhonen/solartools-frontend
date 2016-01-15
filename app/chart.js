'use strict';
(function() {
  var app = angular.module('charts', ['chart.js']);
   
  app.controller('LineChartController', function() {
    this.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.series = ['Series A', 'Series B'];
    this.data = [
      [5, 34, 23, 12, 4, 3, 1, 20, 24, 30, 35, 12],
      [35, 30, 1, 34, 5, 54, 22, 1, 2, 10, 12, 15]
    ];
    this.onClick = function(points, evt) {
      console.log(points, evt);
    };  
  });

  app.controller('TestChartController', function() {
    this.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.series = ['Series A', 'Series B'];
    this.data = [
      [5, 34, 23, 12, 4, 3, 1, 20, 24, 30, 35, 12],
      [35, 30, 1, 34, 5, 54, 22, 1, 2, 10, 12, 15]
    ];
    this.onClick = function(points, evt) {
      console.log(points, evt);
    };  
  });
})();
