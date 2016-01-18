'use strict';
(function() {
  var app = angular.module('charts', ['chart.js']);
   
  app.controller('StatsChartController', ['$scope', 'loc', function($scope, loc) {
    $scope.stats = null;
    var iso8601RegExp = /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})([+-])(\d{2})\:(\d{2})/;
    var dateFormat =  '$3.$2.$1 $4:$5:$6 (UTC$7$8:$9)';
    var dstRegExp = /(\-?\d{1,2})\:(\d{1,2})\:(\d{1,2}\.?\d?)/;

    $scope.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $scope.series = {
      'sun':
        ['Sunset', 'Noon', 'Sunrise'],
      'insolation':
        ['Power at solar noon (W/m2)',
        'Mean hourly energy (Wh/m2/h)']
    };
    $scope.datasets = {
      'sun':
        [
          [18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18], 
          [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
        ],
      'insolation':
        [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    };

    $scope.options = {
      'sun': {
        'animation': false,
        'bezierCurve': false,
        'scaleShowVerticalLines': false,
        'datasetFill': false,
        'scaleOverride': true,
        'scaleStartValue': 0,
        'scaleStepWidth': 1,
        'scaleSteps': 24
      },
      'insolation': {
        'animation': false,
        'bezierCurve': false,
        'scaleShowVerticalLines': false,
        'datasetFill': false,
        'scaleOverride': false,
        'scaleStartValue': 0,
        'scaleStepWidth': 1,
        'scaleSteps': 20
      }
    };
    
    $scope.onClick = function(points, evt) {
      console.log(points, evt);
    };  
    
    $scope.processStats = function(stats) {
      $scope.stats = stats;
      $scope.labels = [];
      $scope.datasets['sun'][0] = [];
      $scope.datasets['sun'][1] = [];
      $scope.datasets['sun'][2] = [];
      $scope.datasets['insolation'][0] = [];
      $scope.datasets['insolation'][1] = [];

      var monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var month = 0;

      var binning = 5;

      for (var i=0; i<stats.days.length; i++) {
        if (i % binning !== 0) {
          continue;
        }

        var day = stats.days[i];

        var match = iso8601RegExp.exec(day['stats']['sunrise']);
        var sunrise = Number(match[4]) + Number(match[5])/60.0 + Number(match[6])/3600.0;
 
        var match = iso8601RegExp.exec(day['stats']['solarnoon']);
        var noon = Number(match[4]) + Number(match[5])/60.0 + Number(match[6])/3600.0;       
        var tempMonth = Number(match[2]);
        var day_num = Number(match[3]);
        
        var match = iso8601RegExp.exec(day['stats']['sunset']);
        var sunset = Number(match[4]) + Number(match[5])/60.0 + Number(match[6])/3600.0;

        console.log('dst : ' + day['stats']['dst'])
        var match = dstRegExp.exec(day['stats']['dst']);
        var dst = Number(match[1]) + Number(match[2])/60.0 + Number(match[3])/3600.0;

        $scope.datasets['sun'][2].push(sunrise-dst);
        $scope.datasets['sun'][1].push(noon-dst);
        $scope.datasets['sun'][0].push(sunset-dst);

        var power = Number(day['stats']['max_power']);
        var energy = Number(day['stats']['daily_insolation'])/24.0;
     
        $scope.datasets['insolation'][0].push(power);
        $scope.datasets['insolation'][1].push(energy);

        month = tempMonth;
        $scope.labels.push('' + monthArr[month-1] + ' ' + day_num);
      }

    };

    $scope.$on('StatsChanged', function(event, stats) {
      $scope.processStats(stats);
    });
  }]);

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
