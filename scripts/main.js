function graphDetrendedFluctuationAnalysis($patient, dfaBody) {
  const id = $patient.data("id");
  const key = "#patient-" + id + " .dfa-graph";
  const graph = document.querySelector(key);
  Plotly.plot(
    graph,
    [
      {
        x: dfaBody.scales,
        y: dfaBody.fluctuation_coefficients,
        mode: "lines+markers"
      }
    ],
    {
      title: "Detrended Fluctuation Analysis (DFA)",
      xaxis: {
        title: "Log of Time Intervals, log(k)",
        showgrid: true
      },
      yaxis: {
        title: "Log of Fluctuation Coefficients, log(y(k))",
        showgrid: true
      }
    }
  );
}

function plotPoincare($patient, poincareBody) {
  const id = $patient.data("id");
  const key = "#patient-" + id + " .poincare-plot";
  const plot = document.querySelector(key);

  Plotly.plot(
    plot,
    [
      {
        x: poincareBody.rr1,
        y: poincareBody.rr2,
        type: "scatter",
        mode: "markers",
        marker: {
          color: "rgba(0, 0, 139, 0.9)",
          size: 5
        }
      }
    ],
    {
      title: "Poincare",
      xaxis: {
        title: "RR(n)",
        showgrid: true
      },
      yaxis: {
        title: "RR(n+1)",
        showgrid: true
      }
    }
  );
}

function generateTimeDomainTableHeaders(expectedTimeDomainMeasures) {
  let headersHtml = "<thead><tr>";
  for (var i = 0; i < expectedTimeDomainMeasures.length; ++i) {
    const key = expectedTimeDomainMeasures[i].toLowerCase();
    headersHtml +=
      '<th data-measure="' +
      key +
      '">' +
      expectedTimeDomainMeasures[i] +
      "</th>";
  }

  headersHtml += "</tr></thead>";
  return headersHtml;
}

function generateTimeDomainBody(
  expectedTimeDomainMeasures,
  timeDomainMeasures
) {
  let bodyHtml = "<tbody><tr>";
  for (var i = 0; i < expectedTimeDomainMeasures.length; ++i) {
    const key = expectedTimeDomainMeasures[i].toLowerCase();
    const measure = timeDomainMeasures[key];
    bodyHtml += '<td data-measure="' + key + '">' + measure + "</td>";
  }
  bodyHtml += "</tr></tbody";
  return bodyHtml;
}

function renderMeasures($patient, timeDomainMeasures, nonLinearMeasures) {
  const expectedTimeDomainMeasures = ["ANN", "SDNN", "RMSSD", "pNN20", "pNN50"];
  const $body = $patient.find(".collapsible-body");

  loaded($patient);

  $body.append(
    '<div class="time">' +
      window.current_start.toDate() +
      " - " +
      window.current_end.toDate() +
      "</div>"
  );

  $body.append(
    '<section class="time-domain-measures"><h5>Time Domain Measures</h5></section>'
  );
  $body.append(
    '<section class="non-linear-measures"><h5>Non-Linear Measures</h5></section>'
  );

  const $timeDomainMeasuresBody = $patient.find(".time-domain-measures");
  const $nonlinearMeasuresBody = $patient.find(".non-linear-measures");
  $timeDomainMeasuresBody.append(
    "<table>" +
      generateTimeDomainTableHeaders(expectedTimeDomainMeasures) +
      generateTimeDomainBody(expectedTimeDomainMeasures, timeDomainMeasures) +
      "</table>"
  );

  $nonlinearMeasuresBody.append(
    '<div class="section-container"><div class="subheader sample-entropy"><span>Sample Entropy: </span>' +
      nonLinearMeasures.sample_entropy +
      "</div></div>"
  );

  $nonlinearMeasuresBody.append(
    '<div class="section-container dfa-container"><div class="dfa-graph"></div><div class="details alpha"><span>Alpha Coefficient(&alpha;): </span>' +
      nonLinearMeasures.dfa.alpha +
      "</div></div>"
  );

  $nonlinearMeasuresBody.append(
    '<div class="section-container poincare-container"><div class="poincare-plot"></div><div class="details sd1"><span>SD1: </span>' +
      nonLinearMeasures.poincare.standard_deviations.sd1 +
      '<div class="details sd1"><span>SD2: </span>' +
      nonLinearMeasures.poincare.standard_deviations.sd2 +
      "</div>" +
      "</div></div>"
  );

  graphDetrendedFluctuationAnalysis($patient, nonLinearMeasures.dfa);
  plotPoincare($patient, nonLinearMeasures.poincare);
}

function loading($patient) {
  const PROGRESS_BAR =
    '<div class="progress"><div class="indeterminate"></div></div>';
  $patient.data("loading", true);
  const $body = $patient.find(".collapsible-body");
  $body.html(PROGRESS_BAR);
}

function loaded($patient) {
  const $progressBar = $patient.find(".progress");
  if ($progressBar) $progressBar.remove();
  $patient.data("loading", false);
  $patient.data("loaded", true);
}

function clearError($patient) {
  const $error = $patient.find(".collapsible-body .error");
  $error.empty();
}

function renderError($patient, message) {
  loaded($patient);
  const $error = $patient.find(".collapsible-body .error");
  $error.text(message);
}

function handlePatientMetrics(payload) {
  if (payload.meta.status_code === 200) {
    const timeDomainMeasures = payload.response.time_domain_measures;
    const nonLinearMeasures = payload.response.non_linear_measures;
    const $self = $(this);
    clearError($self);
    renderMeasures($self, timeDomainMeasures, nonLinearMeasures);
    $("#sidebar").trigger("rowheight");
  } else {
    renderError($self, payload.meta.message);
  }
}

function bindClickOntoPatients() {
  const $patient = $(".patient-row");
  $patient.click(function(e) {
    const id = $(this).data("id");
    const isLoading = $(this).data("loading");
    const hasLoaded = $(this).data("loaded");
    const isOpening = !$(this).hasClass("active");

    // Fetch data if:
    //  1) Data is not currently loading
    //  2) Data has not already loaded in this session
    //  3) Patient data is being opened, not closed
    if (!isLoading && !hasLoaded && isOpening) {
      if (
        !window.patient_time_dicts ||
        window.patient_time_dicts[id] === "undefined"
      ) {
        return;
      }

      const defaultTimeWindow =
        window.patient_time_dicts[id - 1]["days"][0]["all"];

      window.current_start = defaultTimeWindow[0];
      window.current_end = defaultTimeWindow[1];

      $(this).data("loading", true);
      getPatientMetrics(
        id,
        defaultTimeWindow[0].unix(),
        defaultTimeWindow[1].unix(),
        handlePatientMetrics.bind(this)
      );
    } else {
      $("#sidebar").trigger("rowheight");
    }
  });
}

function handlePatientsResponse(payload) {
  const patients = payload.response.patients;
  const $patientContainer = $("#patient-container .collapsible");

  for (var i = 0; i < patients.length; ++i) {
    const id = patients[i][0];
    const firstName = patients[i][1];
    const lastName = patients[i][2];
    $patientContainer.append(
      '<li id="patient-' +
        id +
        '" class="patient-row" data-loaded=false data-loading=false data-id="' +
        id +
        '"><div class="collapsible-header">' +
        firstName +
        " " +
        lastName +
        '</div><div class="collapsible-body"><div class="error"></div>' +
        '<div class="progress"><div class="indeterminate"></div></div></div></li>'
    );
  }

  bindClickOntoPatients();
}

$(document).ready(function() {
  getAllPatients(handlePatientsResponse);
});
