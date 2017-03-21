
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
// 'movement-update', {'username':message['username'],'oldX':oldX, 'oldY':oldY,'posX':posX,'posY':posY}
function handleMovementUpdate (updateJSON) {
    //console.log(updateJSON);
    var username = updateJSON['username'];
    var oldX = updateJSON['posX'];
    var oldY = updateJSON['posY'];
    var posX = updateJSON['posX'];
    var posY = updateJSON['posY'];

    console.log('Another player has moved.. \nUser:' + username + ' to ' + posX + ' ' + posY);
    updateCharacterSpritePos(username, oldX, oldY, posX, posY);
}

function performSetup () {
  mapCharacterArray = createMapCharacterArray ();

  connectSocket();
  setupPageUI();
  setupChat();

  setStatusUpdateCallbacks (handleMovementResponse, handleMovementUpdate);

  socket.emit('map-data-request');
  //console.log('spriteArray '+tileSpriteArray);

  //thisPlayer = newCharacterOnMap('foo',tileCount/5,tileCount/5);

}

$(document).ready(performSetup);
