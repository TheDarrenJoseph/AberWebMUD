function performSetup () {
  connectSocket();
  setupPageUI();
  setupChat();

  setStatusUpdateCallbacks ();

  socket.emit('map-data-request');
  //console.log('spriteArray '+tileSpriteArray);

  //thisPlayer = newCharacterOnMap('foo',tileCount/5,tileCount/5);

}

$(document).ready(performSetup);
