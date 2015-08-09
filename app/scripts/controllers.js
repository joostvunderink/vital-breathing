'use strict';

angular.module('breathe.controllers', [])

.controller('BreatheCtrl', ['$scope', '$interval', '$window', 'Settings', '$cordovaVibration', '$localstorage',
function($scope, $interval, $window, Settings, $cordovaVibration, $localstorage) {
  // A bit of a hack, using jQuery to accomplish this.
  // For some reason, $scope.$watch(function() { return $window.innerWidth; })
  // does not update when the window's width is changed.
  $(window).resize(function(){
    $scope.$apply(function() {
      $scope.width = $window.innerWidth;
      $scope.marginLeft = ($scope.width - $scope.timerSize) / 2;
    });
  });

  $scope.timerSize = 200;
  var delta = 40;

  var lastTick;
  var intervalId;

  var iho = new ihoExercise();
  function setInitialDs() {
    $scope.ds = iho.getDisplayStatus();
  }
  setInitialDs();
  $scope.running = false;
  $scope.paused  = false;
  $scope.introSeen = Settings.get('introSeen');
  determineRoundProgressType();
  function determineRoundProgressType() {
    var rptMap = {
      0: 'success',
      1: 'info',
      2: 'warning'
    };
    $scope.roundProgressType = rptMap[$scope.ds.step];
  }

  $scope.introOk = function() {
    Settings.set('introSeen', true);
    $scope.introSeen = true;
  }

  function vibrate(action) {
    if (Settings.get('vibrate')) {
      // TODO: Figure out why $cordovaVibration.vibrate(100) leads to an
      // 'undefined' error somewhere in the cordova library.
      console.log('vibrate');
      navigator.vibrate(Settings.get('vibrations')[action]);
    }
  }

  function updateDisplay() {
    var ds = iho.getDisplayStatus();
    if (!Settings.get('smoothAnimation')) {
      ds.current = parseInt((ds.current + 1000) / 1000) * 1000;
    }
    $scope.ds = ds;
    determineRoundProgressType();
    if (ds.finished) {
      $scope.running = false;
    }
  }

  function update() {
    var currentAction = $scope.ds.action;
    var now = new Date().getTime();

    var diff = now - lastTick;
    lastTick = now;

    iho.update(diff);
    updateDisplay();
    var newAction = $scope.ds.action;
    if (newAction !== currentAction) {
      vibrate(newAction);
    }
  }


  function start() {
    var action = iho.getDisplayStatus().action;
    vibrate(action);
    $scope.currentAction = action;
    iho.reset();
    iho.setSetting('base', Settings.get('base') * 1000);
    iho.setSetting('numRounds', Settings.get('numRounds'));
    lastTick = new Date().getTime();
    $scope.running = true;
    $scope.paused = false;
    $scope.finished = false;
    intervalId = $interval(update, delta);
  }

  $scope.start = start;

  function pause() {
    $interval.cancel(intervalId);
    update();
    $scope.paused = true;
  }

  $scope.pause = pause;

  function resume() {
    lastTick = new Date().getTime();
    intervalId = $interval(update, delta);
    $scope.paused = false;
  }

  $scope.resume = resume;

  function stop() {
    iho.reset();
    $interval.cancel(intervalId);
    $scope.paused = false;
    $scope.running = false;
    $scope.finished = false;
    $scope.pausedAfter = 0;
    setInitialDs();
  }

  $scope.stop = stop;
}])
.controller('SettingsCtrl', function($scope, Settings) {
  $scope.settings = {
    vibrate        : Settings.get('vibrate'),
    base           : Settings.get('base'),
    numRounds  : Settings.get('numRounds'),
    smoothAnimation: Settings.get('smoothAnimation'),
  };

  $scope.baseOptions = range(1, 20);
  $scope.numRoundsOptions = range(1, 20);
  $scope.minRounds = 5;
  $scope.maxRounds = 20;

  function save() {
    Settings.set('vibrate',         $scope.settings.vibrate);
    Settings.set('base',            $scope.settings.base);
    Settings.set('numRounds',   $scope.settings.numRounds);
    Settings.set('smoothAnimation', $scope.settings.smoothAnimation);
  }

  $scope.save = save;

  $scope.modifyNumRounds = function(amount) {
    $scope.settings.numRounds += amount;
    if ($scope.settings.numRounds > $scope.maxRounds) {
      $scope.settings.numRounds = $scope.maxRounds;
    }
    if ($scope.settings.numRounds < $scope.minRounds) {
      $scope.settings.numRounds = $scope.minRounds;
    }
  }
})
.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);;

function range(start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
        foo.push(i);
    }
    return foo;
}
