function resizeSidebar() {
  const height = Math.max($("#patient-container").height(), $(window).height());
  $("#sidebar").height(height);
}

$(document).ready(function() {
  $("#sidebar").bind("rowheight", function() {
    setTimeout(resizeSidebar, 500);
  });

  $(".collapsible").collapsible();
});
