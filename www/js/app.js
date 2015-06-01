'use strict';
Date.prototype.rotation = null;
Date.prototype.day_type = null;
Date.prototype.today = null;
Date.prototype.announcement = null;
Date.prototype.school_start_time = null;
Date.prototype.school_end_time = null;
Date.prototype.display_school_time = null;
Date.prototype.events = [];
Date.prototype.blocks = [];

Date.prototype.getShortDay = function() {
    var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[this.getDay()];
};

Date.prototype.getShortMonth = function() {
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JLY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[this.getMonth()];
};

Date.prototype.getTwoDigitDate = function() {
    var date = this.getDate();
    if (date >= 10) {
        return date + '';
    } else {
        return '0' + date;
    }
};

Date.prototype.getNumberOfWeekdaysSince = function(startDate) {
  startDate.setHours(0, 0, 0, 0);
  startDate = startDate.getTime();
  var millisecondsInDay = 1000 * 60 * 60 * 24;
  var weekdayCounter = 0;
  for (var d = startDate; d !== this.getTime(); d += millisecondsInDay) {
    // increment weekday counter if the day isn't a weekend(sat + sun)
    var fullDate = new Date(d);
    if (fullDate.getDay() !== 0 && fullDate.getDay() !== 6) {
        weekdayCounter++;
    }
  }
  return weekdayCounter;
};

Date.prototype.getRotation = function() {
  if(this.getDay() !== 6 && this.getDay() !== 0) {
    // Before deploying add more than one year's worth of start dates!
    switch (this.getNumberOfWeekdaysSince(new Date(2014, 8, 1)) % 10) {
        case 0:
            return [1, 2, 3, 4];
        case 1:
            return [5, 6, 7, 8];
        case 2:
            return [2, 3, 1, 4];
        case 3:
            return [6, 7, 5, 8];
        case 4:
            return [3, 1, 2, 4];
        case 5:
            return [7, 5, 6, 8];
        case 6:
            return [1, 2, 3, 4];
        case 7:
            return [5, 6, 7, 8];
        case 8:
            return [2, 3, 1, 4];
        case 9:
            return [6, 7, 5, 8];
    }
  }
};

Date.prototype.getStartOfWeek = function() {
    var i = this;
    while(true) {
        if (i.getDay() === 0) {
           return i;
        }
        i.setDate(i.getDate() - 1);
    }
};

Date.prototype.getPrettified = function() {
    // returns the prettified version of the date ex: Friday May 21st, 1999
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var month = months[this.getMonth()];
    var day = days[this.getDay()];
    var year = this.getFullYear();

    // adds ordinal indicators by these rules:
    // -st is used with numbers ending in 1 (e.g. 1st, pronounced first)
    // -nd is used with numbers ending in 2 (e.g. 92nd, pronounced ninety-second)
    // -rd is used with numbers ending in 3 (e.g. 33rd, pronounced thirty-third)
    // As an exception to the above rules, all the 'teen' numbers ending with 11, 12 or 13 use -th (e.g. 11th, pronounced eleventh, 112th, pronounced one hundred [and] twelfth)
    // -th is used for all other numbers (e.g. 9th, pronounced ninth)
    var dateNum = this.getDate();
    var dateEnding = '';
    if (dateNum > 10 && dateNum < 14) {
        dateEnding = 'th';
    } else {
        switch (dateNum % 10) {
            case 1:
                dateEnding = 'st';
                break;
            case 2:
                dateEnding = 'nd';
                break;
            case 3:
                dateEnding = 'rd';
                break;
            default:
                dateEnding = 'th';
                break;
        }
    }
    return day + ' ' + month + ' ' + dateNum + dateEnding + ', ' + year;
};

Date.prototype.generateBlocks = function () {
    this.blocks = [];
    var rotation = this.getRotation();
    var blockStarts, blockEnds, eventTimes, eventNames;
    if (this.getDay() === 0 || this.getDay() === 6){
        return false;
    } else if (this.day_type === 'pro-d') {
        return false;
    } else if (this.day_type === 'early-d'){
        blockStarts =   ['08:30:00', '09:35:00', '11:10:00', '13:15:00'];
        blockEnds =     ['09:30:00', '10:35:00', '12:10:00', '13:15:00'];
        eventTimes =    ['09:30:00', '10:35:00', '12:10:00'];
        eventNames =    ['5 Minute Break', '35 Minute Lunch', '5 Minute Break'];
    } else if (this.day_type === 'holiday'){
        return false;
    } else if (this.day_type === 'late-start'){
        blockStarts =   ['09:50:00', '11:05:00', '12:10:00', '14:00:00'];
        blockEnds =     ['10:50:00', '12:05:00', '13:10:00', '15:00:00'];
        eventTimes =    ['10:50:00', '12:05:00', '13:10:00'];
        eventNames =    ['15 Minute Break', '5 Minute Break', '50 Minute Lunch'];
    }
    else {
        blockStarts =   ['08:30:00', '10:05:00', '11:30:00', '13:40:00'];
        blockEnds =     ['09:50:00', '11:25:00', '12:50:00', '15:00:00'];
        eventTimes =    ['09:50:00', '11:25:00', '12:50:00'];
        eventNames =    ['15 Minute Break', '5 Minute Break', '50 Minute Lunch'];
    }

    for (var i = 0; i < 4; i++) {
        var block = {
            start_time: '',
            end_time: '',
            rotation: rotation[i],
        };
        block.start_time = blockStarts[i];
        block.end_time = blockEnds[i];
        this.blocks.push(block);
    }
    for (var i = 0; i < eventNames.length; i++) {
        var event = {
            name: '',
            time: '',
            info: '',
        };
        event.time = eventTimes[i];
        event.name = eventNames[i];
        this.blocks.push(event);
    }
};

function twentyFourHourToAmPm(timestring) {
    var timeSplit = timestring.split(':');
    timeSplit[0] = parseInt(timeSplit[0]);
    var amPmTime = '';
    if (timeSplit[0] > 12) {
        timeSplit[0] -= 12;
        amPmTime = timeSplit[0] + ':' + timeSplit[1] + 'pm';
    } else if (timeSplit[0] > 23) {
        return 'Invalid Date';
    } else {
        amPmTime = timeSplit[0] + ':' + timeSplit[1] + 'am';
    }
    return amPmTime;
}

function dateStringToValue(timestring) {
    var timeSplit = timestring.split(':');
    timeSplit[0] = parseInt(timeSplit[0]);
    timeSplit[1] = parseInt(timeSplit[1]);
    return (timeSplit[0] * 60 * 60 * 1000) + (timeSplit[1] * 60 * 1000);
}

// function sortByRotation(rotation, blocks) {
//     var newBlocks = [];
//     for (var i = 0; i < rotation.length; i++) {
//         for (var v = 0; v < blocks.length; v++) {
//             if (rotation[i] === blocks[v].rotation) {
//                 newBlocks[i] = blocks[v];
//             }
//         }
//     }
//     return newBlocks;
// }

function compareBlockTimes(block1, block2) {
    var block1IsEvent = false;
    var block2IsEvent = false;
    var block1Start;
    var block2Start;
    if (block1.hasOwnProperty('start_time')) {
        block1Start = dateStringToValue(block1.start_time);
    } else {
        block1Start = dateStringToValue(block1.time);
        block1IsEvent = true;
    }
    if (block2.hasOwnProperty('start_time')) {
        block2Start = dateStringToValue(block2.start_time);
    } else {
        block2Start = dateStringToValue(block2.time);
        block2IsEvent = true;
    }

    if(block1Start < block2Start) {
        return -1;
    } else if (block1Start > block2Start) {
        return 1;
    } else if (block1IsEvent === true && block2IsEvent === false) {
        return 1;
    } else if (block1IsEvent === false && block2IsEvent === true) {
        return -1;
    } else {
        return 0;
    }    
}

var xenon = angular.module('xenon', ['ionic', 'ngResource']);

xenon.config(function($stateProvider) {
  $stateProvider.state('week', {
    url: '/week?date',
    views: {
      'week': {
        templateUrl: 'templates/week.html',
        controller: 'WeekCtrl'
      },
    }
  });

  $stateProvider.state('day', {
    url: '/day?date',
    views: {
      'week': {
        templateUrl: 'templates/day.html',
        controller: 'DayCtrl'
      }
    }
  });
});

xenon.factory('Day', function($resource, $cacheFactory) {
  var days_cache = $cacheFactory('days');
  return $resource('http://107.170.252.240/days/', {}, {
    getDay: {cache: days_cache, method: 'GET', url:'http://107.170.252.240/days/?d=:date&m=:month&y=:year', params: {date:'@date', month: '@month', year: '@year'}},
  });
});

xenon.controller('DayCtrl', ['$scope', '$location', '$cacheFactory', 'Day', '$ionicPopup',
    function ($scope, $location, $cacheFactory, Day, $ionicPopup) {
      function renderDayFromDate(date_arg){
        // sets all $scope variables for day.html template based on date_arg
        date_arg.setHours(0, 0, 0, 0);
        $scope.day = date_arg;
        $scope.day.rotation = $scope.day.getRotation();
        $scope.toAmPm = twentyFourHourToAmPm;
        if ($scope.day.valueOf() === new Date(Date.now()).setHours(0,0,0,0)) {
          $scope.day.today = true;
        }
        Day.getDay({date: $scope.day.getDate(), month: $scope.day.getMonth() + 1, year: $scope.day.getFullYear()}, 
        function (result) {
            // changes $scope.day once data is retrieved from web API
            if (result.count > 0) {
                $scope.day.name = result.results[0].name;
                $scope.day.day_type = result.results[0].day_type;  
                $scope.day.announcement = result.results[0].announcement;
                if (result.results[0].day_blocks.length > 0) {
                    $scope.day.blocks = result.results[0].day_blocks.concat(result.results[0].day_events);
                } else if (result.results[0].day_events.length > 0) {
                    $scope.day.generateBlocks();
                    $scope.day.blocks.concat(result.results[0].day_events);
                } else {
                    $scope.day.generateBlocks();
                }
                if (result.results[0].school_start_time && result.results[0].school_end_time) {
                    $scope.day.school_start_time = result.results[0].school_start_time;
                    $scope.day.school_end_time = result.results[0].school_end_time;
                }
            } else if ($scope.day.getDay() !== 6 || $scope.day.getDay() !== 0) {
                $scope.day.generateBlocks();
            }
            $scope.day.blocks.sort(compareBlockTimes);
        });
    }

    if (!$location.search().date) {
        renderDayFromDate(new Date(Date.now()));
    } else {
        renderDayFromDate(new Date(parseInt($location.search().date))); 
    }

    $scope.doRefresh = function() {
        if (navigator.connection.type === 'none') {
            $ionicPopup.show({
              title: 'No Internet Connection',
              subTitle: 'Refresh again when you have an internet connection to get latest information',
              scope: $scope,
              buttons: [
              { text: 'Ok'},
            ]});
        } else {
            $cacheFactory.get('days').removeAll();
        }
        $scope.$apply();
        $scope.$broadcast('scroll.refreshComplete');
    };
}]);

xenon.controller('WeekCtrl',['$scope', '$location', '$cacheFactory', 'Day', '$ionicPopup',
    function ($scope, $location, $cacheFactory, Day, $ionicPopup) {
        function renderWeekFromDate(date_arg) {
            // sets all $scope variables for week.html template based on date_arg
            $scope.days = [];
            date_arg.setHours(0, 0, 0, 0);
            var next_date = date_arg;
            for (var i = 0; i < 7; i++) {
                var date = new Date(next_date);
                var rotation = date.getRotation();

                if (date.valueOf() === new Date(Date.now()).setHours(0,0,0,0)) {
                    date.today = true;
                }

                if (rotation) {
                    date.rotation = rotation[0] + ' ' + rotation[1] + ' ' + rotation[2] + ' ' + rotation[3];
                }

                Day.getDay({date: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()}, function (result) {
                    if (result.count > 0) {
                        for (var iter = 0; iter < 7; iter++) {
                            // changes $scope.days when data is retrieved from web API
                            if(new Date(result.results[0].date + ' PDT').getDate() === $scope.days[iter].getDate()) {
                                $scope.days[iter].name = result.results[0].name;
                                $scope.days[iter].day_type = result.results[0].day_type;
                                $scope.days[iter].announcement = result.results[0].announcement;
                                if (result.results[0].school_start_time && result.results[0].school_end_time) {
                                    $scope.days[iter].diplaySchoolTime = twentyFourHourToAmPm(result.results[0].school_start_time) + ' - ' + twentyFourHourToAmPm(result.results[0].school_end_time);
                                }
                            }
                        }
                    }
                });

                $scope.days.push(date);
                next_date.setDate(date.getDate() + 1);  
            }   
        }

        $scope.doRefresh = function() {
            if (navigator.connection.type === 'none') {
                $ionicPopup.show({
                    title: 'No Internet Connection',
                    subTitle: 'Refresh again when you have an internet connection to get latest information',
                    scope: $scope,
                    buttons: [
                    { text: 'Ok'},
                ]});
            } else {
                $cacheFactory.get('days').removeAll();
            }
            $scope.$apply();
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.incrementWeek = function() {
            if (!$location.search().date) {
                $location.search('date', Date.now());
            }
            var dateToRender = new Date(parseInt($location.search().date)).getStartOfWeek();
            dateToRender.setDate(dateToRender.getDate() + 7);
            $location.search('date', dateToRender.valueOf());
        };

        $scope.decrementWeek = function() {
            if (!$location.search().date) {
                $location.search('date', Date.now());
            }
            var dateToRender = new Date(parseInt($location.search().date)).getStartOfWeek();
            dateToRender.setDate(dateToRender.getDate() - 7);
            $location.search('date', dateToRender.valueOf());
        };

        if (!$location.search().date) {
            $scope.weekStart = new Date(Date.now()).getStartOfWeek();
            renderWeekFromDate($scope.weekStart);
        } else {
            $scope.weekStart = new Date(parseInt($location.search().date)).getStartOfWeek();
            renderWeekFromDate($scope.weekStart); 
        }
}]);


xenon.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});