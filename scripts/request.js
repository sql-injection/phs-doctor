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

function getMessagesByPatientId(id, successCallback, errorCallback) {
  $.get(API_URL + "/patient/" + id + "/messages")
    .done(successCallback)
    .fail(errorCallback);
}

function sendMessage(
  patientId,
  doctorId,
  messageText,
  successCallback,
  errorCallback
) {
  $.ajax({
    type: "POST",
    url: API_URL + "/message",
    data: JSON.stringify({
      patient_id: patientId,
      doctor_id: doctorId,
      from_patient: false,
      message_text: messageText
    }),
    success: successCallback,
    error: errorCallback,
    contentType: "application/json",
    dataType: "json"
  });
}

function getPatientMedicalInfo(
  firstName,
  lastName,
  start,
  end,
  successCallback,
  errorCallback
) {
  $.get(
    API_URL +
      "/patient/" +
      lastName +
      "/" +
      firstName +
      "?start=" +
      start +
      "&end=" +
      end
  )
    .done(successCallback)
    .fail(errorCallback);
}
