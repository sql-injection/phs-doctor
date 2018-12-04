function renderMessages(payload) {
  if (payload.meta.status_code === 200) {
    const messages = payload.response;
    const $conversationHistory = $("#conversation-history");
    $conversationHistory.empty();
    var messagesHtml = "<ul>";

    if (messages.length < 1) {
      $conversationHistory.append(
        '<span class="no-messages">No messages with this patient</span>'
      );
      return;
    }

    for (var i = 0; i < messages.length; ++i) {
      const sender = messages[i].from_patient ? "patient" : "doctor";
      messagesHtml +=
        '<li class="message sender-' +
        sender +
        '"><span>' +
        messages[i].message_text +
        "</span></li>";
    }

    messagesHtml += "</ul>";

    $conversationHistory.append(messagesHtml);
    scrollDownToMostRecentMessage();
  } else {
    // Render error
  }
}

function bindClickEventOnContacts() {
  const $contact = $(".contact");

  $contact.click(function() {
    const $self = $(this);
    const id = $self.data("id");
    const $conversation = $("#conversation");
    const $messageForm = $("#message-form");

    $contact.removeClass("active");
    if (!$self.hasClass("active")) $self.addClass("active");

    $messageForm.attr("data-id", id);
    $messageForm.show();
    getMessagesByPatientId(id, renderMessages);
  });
}

function scrollDownToMostRecentMessage() {
  const conversationHistory = document.getElementById("conversation-history");
  conversationHistory.scrollTop = conversationHistory.scrollHeight;
}

function bindMessageSendEvent() {
  const $messageForm = $("#message-form");
  const $messageInput = $("#message-input input");

  $messageForm.submit(function(e) {
    e.preventDefault();
    const messageText = $messageInput.val();
    const patientId = $messageForm.data("id");
    $messageInput.val("");
    sendMessage(patientId, 1, messageText, function() {
      getMessagesByPatientId(patientId, renderMessages);
    });
  });
}

function getAllPatientsResponse(payload) {
  const patients = payload.response.patients;
  const $contactList = $("#contact-list");

  var contacts = "<ul>";
  for (var i = 0; i < patients.length; ++i) {
    const id = patients[i][0];
    const firstName = patients[i][1];
    const lastName = patients[i][2];
    contacts +=
      '<li class="contact" data-id="' +
      id +
      '">' +
      firstName +
      " " +
      lastName +
      "</li>";
  }

  contacts += "</ul>";
  $contactList.append(contacts);
  bindClickEventOnContacts();
}

$(document).ready(function() {
  getAllPatients(getAllPatientsResponse);
  bindMessageSendEvent();
});
