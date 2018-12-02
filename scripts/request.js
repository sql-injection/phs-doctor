function getAllPatients(successCallback, errorCallback) {
  $.get(API_URL + "/patient/all")
    .done(successCallback)
    .fail(errorCallback);
}

function getPatientMetrics(id, start, end, successCallback, errorCallback) {
  $.get(API_URL + "/patient/" + id + "/metrics?start=" + start + "&end=" + end)
    .done(successCallback)
    .fail(errorCallback);
}
