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

    app.service('loc', ['$http', 'config', function($http, config) {
      var serv = this;
      this.location_info = null;
      this.stats = null;
      this.city = null;

      this.setCity = function(city) {
        if (city == null) {
          this.resetCity();
          return;
        }
        serv.city = city;
        serv.loction_info = null;
        serv.stats = null;

        // Now fetch the city from REST API
        $http.get(config.restAPI + '/location?city=' + city).then(function(data) {
          serv.setLocationInfo(data.data);
          console.log('Location set for city: ' + city);
          // We have basic location information, so let us fetch also stats
          $http.get(config.restAPI + '/stats?city=' + city).then(function(data) {
            serv.setStats(data.data);
            console.log('Stats set for city: ' + city);
          }, function(err) {
            console.log('Failed to set stats: ' + err);
          });
        }, function(err) {
          console.log('Failed to set location: ' + err);
        });
        console.log('City set to : ' + serv.city);
      };

      this.resetCity = function() {
        serv.city = null;
        serv.location_info = null;
        serv.stats = null;
        console.log('City reset');
      };

      this.setLocationInfo = function(newLocationInfo) {
        serv.location_info = newLocationInfo;
        console.log('Location info set for city: ' + this.city);
      };

      this.setStats = function(newStats) {
        serv.stats = newStats;
        console.log('Stats set for city: ' + this.city);
      };

      return {
        setCity: this.setCity,
        resetCity: this.resetCity,
        city: this.city,
        location_info: this.location_info,
        stats: this.stats
      };
    }]);

    app.controller('CalcController', ['$http', 'config', 'loc', function($http, config, loc) {
      var ctrl = this;

      this.setCity = function(city) {
        loc.setCity(city);
      };
      
      this.resetCity = function() {
        loc.resetCity(); 
      };
    }]);

    app.controller('LocationFormController', ['$http', 'config', 'loc', function($http, config, loc) {
      var ctrl = this;
      this.city = null; // this is where the form saves the city
      this.cities = {};
      this.statusMsg = 'Fetching cities...';
     
      this.setCity = function() {
        loc.setCity(this.city);
      };

      this.resetCity = function() {
        loc.resetCity();
      };

      $http.get(config.restAPI + '/cities').then(function(data) {
        ctrl.cities = data.data;
        ctrl.statusMsg = 'Select a city from the list';
      }, function(err) {
        ctrl.statusMsg = 'Fetching cities failed.';
        console.log('Failed to read in city data from REST API: ' + err);
      });
    }]);

})();
