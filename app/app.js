'use strict';
(function() {
    var app = angular.module('solarcalc', ['config', 'charts']);
    
    var coordRegExp = /(\-?)(\d{1,2})\:(\d{1,2})\:(\d{1,2}\.\d)/;
    var coordFormat = '$1$2°$3′$4″';
    var iso8601RegExp = /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})([+-])(\d{2})\:(\d{2})/;
    var dateFormat =  '$3.$2.$1 $4:$5:$6 (UTC$7$8:$9)';
    var dateFormatShort = '$4:$5:$5';
    var dateOnlyFormat = '$3.$2.$1';
    var degreeRegExp = /(\-?\d{1,2})\:(\d{1,2})\:(\d{1,2}\.\d)/;
    var hourAngleRegExp = /(\-?\d{1,2})\:(\d{1,2})\:(\d{1,2}\.\d)/;
    var hourRegExp = /(\-?\d{1,2})\:(\d{1,2})\:(\d{1,2})/;
  
    app.filter('coordLat', function() {
      return function(input) {
        if (input === undefined) return;
        input = input.replace(coordRegExp, coordFormat);
        if (input[0] !== '-') {
          return input + ' N';
        }
        else {
          return input.substr(1) + ' S'; 
        }
      };
    });

    app.filter('coordLon', function() {
      return function(input) {
        if (input === undefined) return;
        input = input.replace(coordRegExp, coordFormat);
        if (input[0] !== '-') {
          return input + ' E';
        }
        else {
          return input.substr(1) + ' W';
        }
      };
    });
   
    app.filter('round', function() {
      return function(input) {
        return Math.round(Number(input));
      };
    });

    app.filter('isodate', function() {
      return function(input, format) {
        if (input === undefined) return;
        if (format === 'short') {
          input = input.replace(iso8601RegExp, dateFormatShort);
        }
        else if ( format === 'dateonly') {
          input = input.replace(iso8601RegExp, dateOnlyFormat);  
        }
        else {
          input = input.replace(iso8601RegExp, dateFormat);
        }
        return input;
      };
    });

    app.filter('degree', function() {
      return function(input) {
        if (input === undefined) return;
        var match = degreeRegExp.exec(input);
        var degrees = Number(match[1]);
        var minutes = Number(match[2]);
        var seconds = Number(match[3]);
        var total_degrees = degrees + minutes/60.0 + seconds/3600.0;
        return '' + Math.round(100.0*total_degrees)/100.0 + '°';
      };
    });

    app.filter('hourangle', function() {
      return function(input) {
        if (input === undefined) return;
        var match = hourAngleRegExp.exec(input);        
        var degrees = Number(match[1]);
        var minutes = Number(match[2]);
        var seconds = Number(match[3]);
        var total_degrees = degrees + minutes/60.0 + seconds/3600.0;
        return '' + degrees + ' hrs, ' + minutes + ' min,  ' + seconds + ' sec';
      };
    });
    
    app.filter('hours', function() {
      return function(input, format) {
        if (input === undefined) return;
        var match = hourRegExp.exec(input);        
        var degrees = Number(match[1]);
        var minutes = Number(match[2]);
        var seconds = Number(match[3]);
        var total_degrees = degrees + minutes/60.0 + seconds/3600.0;
        if (format === 'short') {
          return '' + degrees + ':' + ('00'+minutes).slice(-2) + ':' + ('00'+seconds).slice(-2);
        }
        else {
          return '' + degrees + ' hrs, ' + minutes + ' min,  ' + seconds + ' sec';
        }
      };
    });

    app.service('loc', ['$rootScope', '$http', 'config', function($rootScope, $http, config) {
      var serv = this;
      var _location_info = null;
      var _stats = null;
      var _city = null;

      var setCity = function(city) {
        if (city == null) {
          resetCity();
          return;
        }
        _city = city;
        $rootScope.$broadcast('CityChanged', _city);

        // Now fetch the city from REST API
        $http.get(config.restAPI + '/location?city=' + city).then(function(data) {
          setLocationInfo(data.data);
          console.log('Location info fetched successfully for city: ' + city);
          // We have basic location information, so let us fetch also stats
          $http.get(config.restAPI + '/stats?city=' + city).then(function(data) {
            setStats(data.data);
            console.log('Stats fetched successfully for city: ' + city);
          }, function(err) {
            console.log('Failed to fetch stats for city: ' + err);
          });
        }, function(err) {
          console.log('Failed to fetch location info for city: ' + err);
        });
        console.log('City set to : ' + _city);
      };

      var resetCity = function() {
        _city = null;
        _location_info = null;
        _stats = null;
        $rootScope.$broadcast('CityReset');
        console.log('City reset');
      };

      var setLocationInfo = function(location_info) {
        _location_info = location_info;
        $rootScope.$broadcast('LocationInfoChanged', _location_info);
        console.log('Location info set for city: ' + _city);
        console.log(_location_info);
      };

      var setStats = function(stats) {
        _stats = stats;
        $rootScope.$broadcast('StatsChanged', _stats);
        console.log('Stats set for city: ' + _city);
        console.log(_stats);
      };

      return {
        setCity: setCity,
        resetCity: resetCity,
      };
    }]);

    app.controller('CalcController', ['$scope', '$http', 'config', 'loc', function($scope, $http, config, loc) {
      $scope.city = null;
      $scope.location_info = null;
      $scope.stats = null;

      $scope.setCity = function(city) {
        loc.setCity(city);
      };
      
      $scope.resetCity = function() {
        loc.resetCity(); 
      };

      $scope.$on('CityReset', function(event) {
        $scope.city = null;
        $scope.location_info = null;
        $scope.stats = null;
        console.log('CalcController received CityReset event');
      });

      $scope.$on('CityChanged', function(event, city) {
        $scope.city = city;
        console.log('CalcController received CityChanged event: ');
        console.log(city);
      });

      $scope.$on('LocationInfoChanged', function(event, location_info) {
        $scope.location_info = location_info;
        console.log('CalcController received LocationInfoChanged event: ');
        console.log(location_info);
      });

      $scope.$on('StatsChanged', function(event, stats) {
        $scope.stats = stats;
        console.log('CalcController received StatsChanged event: ');
        console.log(stats);
      });
    }]);

    app.controller('LocationFormController', ['$scope', '$http', 'config', 'loc', function($scope, $http, config, loc) {
      $scope.city = null; // this is where the form saves the city
      $scope.cities = {};
      $scope.statusMsg = 'Fetching cities...';
     
      $scope.setCity = function(city) {
        loc.setCity(city);
      };

      $scope.resetCity = function() {
        loc.resetCity();
      };

      $http.get(config.restAPI + '/cities').then(function(data) {
        $scope.cities = data.data;
        $scope.statusMsg = 'Select a city from the list';
      }, function(err) {
        $scope.statusMsg = 'Fetching cities failed.';
        console.log('Failed to read in city data from REST API: ' + err);
      });
    }]);

})();
