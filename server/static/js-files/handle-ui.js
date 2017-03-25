var htmlWindows = {messageWindowId: '#message-window', statWindowId: '#stat-window', inventoryWindowId: '#inventory-window'};

function stageDoubleClicked (mouseEvent) {
	if (renderer.plugins.interaction.pointer.originalEvent.type === 'pointerdown') {
		console.log('movement click!');
		var coords = pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY);
		coords = localTilePosToGlobal (coords[0], coords[1]);

		console.log('GLOBAL POSITION CLICKED: '+coords);

		sendMovementCommand(coords[0], coords[1]);
	}
}

function stageClicked (renderer) {
	var mouseEvent = renderer.plugins.interaction.pointer.originalEvent;
	//	console.log(pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY));
	setTimeout(function () { return stageDoubleClicked(mouseEvent); }, 150);
}

//	tileSpriteArray -- the grid array of sprites available to the UI
//	mapData -- the JSON response from the server describing the area
//	startX/Y - the start areas to draw from
function drawMapToGrid (startX, startY) {
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
					}
				}

	} else {
		console.log('MAP DRAWING| overworld map data from remote is missing.');
	}

}

function hideWindows(dialog) {
	var dialog = $(htmlWindows[dialog]);
	var toHide = dialog.is(':visible'); //Check if the dialog is visible to begin with

	$('.dialog:visible').hide();

	if (toHide) {
		console.log('vis');
		dialog.hide();
	} else {
		dialog.show();
	}
}

function toggleStatWinVisibility () {
	hideWindows('statWindowId');
}

function toggleIventoryWinVisibility () {
	hideWindows('inventoryWindowId');
}

function toggleConsoleVisibility () {
	hideWindows('messageWindowId');
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
			setMessageLog('Please enter the password for user '+username);
		} else {
			setMessageLog('Account created, please enter your password');
		}

		bindMessageButton(false,username);
}


function showControls (show) {
	controlsContainer.visisble = show;
	renderer.render(controlsContainer);
}

function sendPassword(username) {
	var passwordField = $('#password-input');

	sendAuthentication(username, passwordField.val());
	passwordField.val(''); //Blank the field now we're done getting input
	passwordField.hide(); //Hide the field to show the normal input box
	$('#message-log').val('');
	bindMessageButton(true,username); //Set the send button behavior back to normal
}

//Switches the 'Send' message behavior from message to password sending
function bindMessageButton(isText,username){
	var thisButton = $('#send-message-button');
	thisButton.unbind('click');

	if(isText) {
		thisButton.click(
				function() {
					sendNewChatMessage();
					clearMessageInputField();
				}
		);
	} else {
		thisButton.click (function () { return sendPassword(username); });
	}
}

function bindStageClick(enabled) {
	var mainWindow = $('#main-window');
	if(enabled){
		mainWindow.on('click',
				function () {
					return stageClicked(renderer);
				}
			);
	} else {
		mainWindow.unbind('click');
	}
}

function disableUI() {
	bindStageClick(false); //	Turns off stage-click input
	showControls (false);
	renderer.render(stage);
}

function enableUI() {
	bindStageClick(true); //	Activate movement click input
	showControls (true);
	renderer.render(stage);
}

//	data -- 'username':username,'sessionId':sid, 'character':thisPlayer
function handlePlayerLogin(data){
	//	console.log(data);
	var playerStatus = data['player-status'];
	console.log('Login data received: ');
	console.log(data);

	//	Update the client session to contain our new data
	clientSession.sessionId = data['sessionId'];

	clientSession.username = playerStatus['username'];
	clientSession.character.charname = playerStatus['charname'];
	clientSession.character.posX = playerStatus['pos_x'];
	clientSession.character.posY = playerStatus['pos_y'];

	console.log('Saved session object: ');
	console.log(clientSession);

	enableUI();
	showMapPosition(clientSession.character.posX, clientSession.character.posY);

	//Creates the new character to represent the player
	newCharacterOnMap (clientSession.character.charname , clientSession.character.posX, clientSession.character.posY);

	console.log('Logged in! Welcome!');

}

function bindEvents () {
	 bindMessageButton(true);
}