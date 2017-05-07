//Sets up client elements, hooks up callbacks to enable event-driven reponses, then asks the server for a map update
function performSetup () {
  connectSocket();
  setupPageUI();
  setupChat();

  setStatusUpdateCallbacks ();

  socket.emit('map-data-request');
}

//Initialises the client setup once the HTML page loads
$(document).ready(performSetup);
