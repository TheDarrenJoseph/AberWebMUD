function performSetup () {
  connectSocket();
  setupPageUI();
  setupChat();

  setStatusUpdateCallbacks ();

  socket.emit('map-data-request');
}

$(document).ready(performSetup);
