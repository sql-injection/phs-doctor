function Timestamps() {
  this.times = {};
  this.next = null;
}

function Timestamp(patientId) {
  this.patientId = patientId;
  this.start = null;
  this.end = null;
}

Timestamps.prototype.addPatient = function(patientId, start, end) {
  var pid = String(patientId);
  this.times[pid] = [];
  var startMoment = moment.unix(start);
  var endMoment = moment.unix(end);

  this.next = moment(startMoment);
  while (this.next.isBefore(endMoment)) {
    var endOfDay = moment(this.next).endOf("day");
    var ts = new Timestamp(patientId);
    ts.start = this.next;

    if (endMoment.isBefore(endOfDay)) {
      ts.end = moment(endMoment);
    } else {
      ts.end = moment(endOfDay);
    }

    this.times[pid].push(ts);
    this.next = moment(this.next)
      .add(1, "days")
      .startOf("day");
  }

  this.next = null;
};

Timestamps.prototype.printDays = function() {
  for (patientId in this.times) {
    console.log("Patient", patientId, ":");
    for (var i = 0; i < this.times[patientId].length; ++i) {
      var interval = this.times[patientId][i];
      console.log(interval.start.toDate(), "->", interval.end.toDate());
    }
  }
};
