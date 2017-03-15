
//Handles a movement response (success/fail) for this client's move action
function handleMovementResponse (responseJSON) {
  var success = responseJSON['success'];

  //  response{username,success? posX, posY : blank}
  console.log('Movement response.. Success:' + success);

  if (success) {
    drawCharacterToGrid (responseJSON['posX'], responseJSON['posY']);
    console.log('New pos: '+responseJSON['posX'] + ' ' + responseJSON['posY']);

  }

}

//Handles a movement
function handleMovementUpdate (updateJSON) {
    //console.log(updateJSON);
    var charname = updateJSON['charname'];
    var posX = updateJSON['posX'];
    var posY = updateJSON['posY'];

    console.log('Another player has moved.. \nCharacter:' + charname + ' at ' + posX + ' ' + posY);
}

function performSetup () {
  mapCharacterArray = createMapCharacterArray ();

  connectSocket();
  setupPageUI();
  setupChat();
  setupStatusUpdates(handleMovementResponse);
  socket.emit('map-data-request');
  //console.log('spriteArray '+tileSpriteArray);

  //thisPlayer = newCharacterOnMap('foo',tileCount/5,tileCount/5);

}

$(document).ready(performSetup);
