var htmlWindows = {messageWindowId: '#message-window', statWindowId: '#stat-window', inventoryWindowId: '#inventory-window'};

function checkConnection() {
  if (!isSocketConnected()) {
     hideWindows();
     showControls(false);
     showDialog();
     updateMessageLog ('Connection lost to server!', 'client');
  }
}

//Handles a movement response (success/fail) for this client's move action
function handleMovementResponse (responseJSON) {
  var success = responseJSON['success'];

	//Let the player know if their move is invalid/unsuccessful
  if (!success) {
		updateMessageLog ('You cannot move there!', 'server');
  }
}

//	tileSpriteArray -- the grid array of sprites available to the UI
//	mapData -- the JSON response from the server describing the area
//	startX/Y - the start areas to draw from
function drawMapToGrid (startX, startY) {
	mapContainer.removeChildren(); //Clear the map display container first

	//	Check there's at least enough tiles to fill our grid (square map)
	if (overworldMap.length >= tileCount) {
				var endX = startX+tileCount;
				var endY = startY+tileCount;

				console.log('MAP DRAWING| to grid from: '+startX+' '+startY+' to '+endX+' '+endY);

				//	Local looping to iterate over the view tiles
				for (var x = 0; x < tileCount; x++) {
					for (var y = 0; y < tileCount; y++) {
						//	Accessing one of the window tiles
						var tileSprite = tileSpriteArray[x][y];

						try {
							var globalXY = localTilePosToGlobal(x, y);
							var globalX = globalXY[0];
							var globalY = globalXY[1];

								if (isPositionInOverworld(globalX, globalY)) {
									var tileFromServer = overworldMap[globalX][globalY];

										if (tileSprite != null && tileFromServer != null) { //	Check the data for this tile exists
											//	var thisSprite = mapContainer.getChildAt(0); //	Our maptile sprite should be the base child of this tile
											var subTexture = getAtlasSubtexture(overworldAtlasPath, tileMappings[tileFromServer.tileType]);

											//If the texture exists, set this sprite's texture,
											// and add it back to the container
											if (subTexture != null) {
												tileSprite.texture = subTexture;
												mapContainer.addChild(tileSprite);
											}
										}

								}
							} catch (err) {
								continue;
							}
					}
				}

	} else {
		console.log('MAP DRAWING| overworld map data from remote is missing.');
	}

}

function showWindow(dialog){
	var dialog = $(htmlWindows[dialog]);
	dialog.show();
}

function hideWindow(dialog) {
	var dialog = $(htmlWindows[dialog]);
	dialog.hide();
}

function hideWindows() {
  for (windowId in htmlWindows) {
    hideWindow(windowId);
  }
}

function toggleWindow(dialog) {
	var dialog = $(htmlWindows[dialog]);
	var toHide = dialog.is(':visible'); //Check if the dialog is visible to begin with

	$('.dialog:visible').hide();

	if (toHide) {
		dialog.hide();
	} else {
		dialog.show();
	}
}

function toggleStatWinVisibility () {
	toggleWindow('statWindowId');
}

function toggleIventoryWinVisibility () {
	toggleWindow('inventoryWindowId');
}

function toggleConsoleVisibility () {
	toggleWindow('messageWindowId');
}

function showDialog () {
	dialogBackground.visible = !dialogBackground.visible;
	renderer.render(stage); //	update the view to show this
}

//Triggered once a user sends a login message, asks for user password
//username is a username string
function requestUserPassword (username) {
	console.log('password requested for '+username);

		$('#password-input').show();

		if(username !== undefined) {
			clientSession.username = username; //Set the current session username
			setMessageLog('Please enter the password for user '+username);
		} else {
			setMessageLog('Account created, please enter your password');
		}

		bindMessageButton(false); //Set the send message behaviour to password sending
}

function userDoesNotExist(username) {
  var new_user = confirm('User does not exist, do you want to create it?');
  if (new_user) requestUserPassword (username);
}

function showControls (show) {
	controlsContainer.visisble = show;
	renderer.render(controlsContainer);
}

function sendPassword() {
	var passwordField = $('#password-input');
	var username = clientSession.username;
  var passwordInput = passwordField.val();

	if (username != null && passwordInput != '') {
		sendAuthentication(username, passwordInput);
		passwordField.val(''); //Blank the field now we're done getting input
		passwordField.hide(); //Hide the field to show the normal input box
		$('#message-log').val('');
		bindMessageButton(true); //Set the send button behavior back to normal
	} else {
    updateMessageLog('Invalid password.', 'client');
  }
}

function requestCharacterDetails() {
	showStatWindow();
	updateMessageLog('You need to set your character details.', 'client');
}


//Checks that the player's character details are set, and asks them to set them if false
function checkCharacterDetails() {
	console.log(clientSession.character);

	if (!characterDetailsExist ()) {
		requestCharacterDetails();
	} else {
    characterDetailsConfirmed();
  }
}

function handleCharacterUpdateResponse(messageJson){
  if (messageJson['success'] != null){
    //If local character details have yet to be set, and this is valid

    console.log('DETAILS EXIST?: ' + characterDetailsExist());
    if (!characterDetailsExist ()) {
      if (messageJson['success'] == true) {
        characterDetailsConfirmed();
      } else {
        updateMessageLog('Invalid character details', 'server');
      }
    } else {
      console.log('Updating existing details.. ');
      updateMessageLog('Invalid character update', 'server');
    }
  }
}

//Continues the login process after a user inputs their character details
function characterDetailsConfirmed() {
  hideWindow('statWindowId'); //Hide the stats windows

  //TODO -- UPDATE SESSION DETAILS

	enableUI(); //Enables player interactions
	showMapPosition(clientSession.character.pos_x, clientSession.character.pos_y);
	//Creates the new character to represent the player
	newCharacterOnMap (clientSession.character.charname , clientSession.character.pos_x, clientSession.character.pos_y);
}

//	data -- 'username':username,'sessionId':sid, 'character':thisPlayer
function handlePlayerLogin(data){
	//	console.log(data);
	updateClientSessionData(data); //Updates the clientSession
	checkCharacterDetails(); //Check/Prompt for character details
}

function handlePlayerLoginError (data) {
  console.log(data);
  if (data['playerExists']) {
    updateMessageLog('Login failure (bad password)', 'server');
  } else {
    updateMessageLog('Login failure (player does not exist)', 'server');
  }
}
