function minMoment(a, b) {
  if (a.isAfter(b)) {
    return b;
  } else {
    return a;
  }
}

function maxMoment(a, b) {
  if (a.isAfter(b)) {
    return a;
  } else {
    return b;
  }
}

function getPatientTimestampSplits(minTimestamp, maxTimestamp) {
  var timestampSplits = {};
  var startMoment = moment.unix(minTimestamp);
  var endMoment = moment.unix(maxTimestamp);

  timestampSplits["all"] = [startMoment, endMoment];
  days = [];
  times = {};

  times["start"] = startMoment;
  while (times["start"].isBefore(endMoment)) {
    var day = {};
    times["end"] = minMoment(moment(times["start"]).endOf("day"), endMoment);

    // Morning phase
    morningStart = moment(times["start"])
      .set("hour", 6)
      .set("minute", 0)
      .set("second", 0);
    morningEnd = moment(times["end"])
      .set("hour", 14)
      .set("minute", 0)
      .set("second", 0);

    // Afternoon phase
    afternoonStart = moment(times["start"])
      .set("hour", 14)
      .set("minute", 0)
      .set("second", 0);

    (afternoonEnd = moment(times["end"])
      .set("hour", 22)
      .set("minute", 0)
      .set("second", 0)),
      times["end"];

    // Evening 1 phase
    evening1Start = moment(times["start"])
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0);

    (evening1End = moment(times["end"])
      .set("hour", 6)
      .set("minute", 0)
      .set("second", 0)),
      times["end"];

    // Evening 2 phase
    evening2Start = moment(times["start"])
      .set("hour", 22)
      .set("minute", 0)
      .set("second", 0);

    evening2End = moment(times["end"])
      .set("hour", 24)
      .set("minute", 0)
      .set("second", 0);

    day["all"] = [times["start"], times["end"]];
    day["morning"] = [morningStart, morningEnd];
    day["afternoon"] = [afternoonStart, afternoonEnd];
    day["evening_1"] = [evening1Start, evening1End];
    day["evening_2"] = [evening2Start, evening2End];
    days.push(day);

    times["start"] = times["end"].add(1, "seconds");
  }

  timestampSplits["days"] = days;

  return timestampSplits;
}

const PATIENT_MIN_MAX_TIMESTAMPS = [
  [1478072497, 1478249398],
  [1477893337, 1477998632],
  [1477723037, 1477859312],
  [1478126419, 1478247989],
  [1477909794, 1477967465],
  [1477343231, 1477436683],
  [1477309487, 1477429165],
  [1477429327, 1478200239],
  [1477893337, 1477998632]
];

window.patient_time_dicts = [];

for (var i = 0; i < PATIENT_MIN_MAX_TIMESTAMPS.length; ++i) {
  ts = PATIENT_MIN_MAX_TIMESTAMPS[i];
  result = getPatientTimestampSplits(ts[0], ts[1]);
  window.patient_time_dicts.push(result);
}
