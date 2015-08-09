'use strict';

function ihoExercise() {
  var api = {
    getDisplayStatus: getDisplayStatus,
    getStatus       : getStatus,
    setSetting      : setSetting,
    getSettings     : getSettings,
    reset           : reset,
    update          : update,
  };

  var settings = {
    base: 5000,
    numIterations: 10
  };

  var sequence = [
    {
      action: 'in',
      color: '#31B404',
      factor: 1
    },
    {
      action: 'hold',
      color: '#FF8000',
      factor: 4
    },
    {
      action: 'out',
      color: '#A901DB',
      factor: 2
    }
  ];

  var status = getInitialStatus();
  var displayStatus;
  updateDisplayStatus();

  // End 

  function getInitialStatus() {
    return {
      step              : 0,
      timeSinceStepStart: 0,
      iteration         : 1,
      finished          : false
    };

  }
  function reset() {
    status = getInitialStatus();
    updateDisplayStatus();
  }

  function setSetting(name, value) {
    settings[name] = value;
    updateDisplayStatus();
    return value;
  }

  function getSettings() {
    return settings;
  }

  function getDisplayStatus() {
    return displayStatus;
  }

  function getStatus() {
    return status;
  }

  function updateDisplayStatus() {
    displayStatus = {
      iteration    : status.iteration,
      numIterations: settings.numIterations,
      finished     : status.finished,
      max          : sequence[status.step].factor * settings.base,
      current      : status.timeSinceStepStart,
      action       : sequence[status.step].action,
      color        : sequence[status.step].color,
      countdown    : parseInt((sequence[status.step].factor * settings.base + 1000 - status.timeSinceStepStart) / 1000),
    };
  }

  // This method is used to update the status. In effect, it tells this class
  // how much time has passed. The delta variable is normally in milliseconds.
  function update(delta) {
    if (status.finished) {
      return;
    }

    status.timeSinceStepStart += delta;

    while (status.timeSinceStepStart > sequence[status.step].factor * settings.base) {
      status.timeSinceStepStart -= sequence[status.step].factor * settings.base;

      status.step++;

      if (status.step >= sequence.length) {
        status.iteration++;
        status.step = 0;
      }

      if (status.iteration > settings.numIterations) {
        status.iteration          = 0;
        status.step               = 0;
        status.timeSinceStepStart = 0;
        status.finished           = true;
      }
    }

    updateDisplayStatus();
  }

  return api;

}
