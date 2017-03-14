var htmlWindows = {messageWindowId: '#message-window', statWindowId: '#stat-window', inventoryWindowId: '#inventory-window'};

function stageDoubleClicked (mouseEvent) {
	if (renderer.plugins.interaction.pointer.originalEvent.type === 'pointerdown') {
		console.log('movement click!');
		var coords = pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY);
		sendMovementCommand(coords['x'], coords['y']);
	}
}

function stageClicked (renderer) {
	hideWindows(); //Minimises all dialog windows to give the screen focus

	var mouseEvent = renderer.plugins.interaction.pointer.originalEvent;
	//console.log(pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY));
	setTimeout(function () { return stageDoubleClicked(mouseEvent); }, 150);
}

//tileSpriteArray -- the grid array of sprites available to the UI
//mapData -- the JSON response from the server describing the area
//startX/Y - the start areas to draw from
function drawMapToGrid (startX, startY) {
	console.log('drawing map to grid: '+overworldMap.length);

	//Check there's at least enough tiles to fill our grid
	if (overworldMap.length >= tileCount) {
			if (isPositionInMapView(startX, startY)) {
				for (var x = startX; x < tileCount; x++) {
					for (var y = 0; startY < tileCount; y++) {
							var tileSprite = tileSpriteArray[x][y]; // Reference to new tile in the array
							var tileFromServer = overworldMap[x][y];

							if (tileSprite != null &&  tileFromServer != null){ //Check the data for this tile exists
								//var thisSprite = mapContainer.getChildAt(0); //	Our maptile sprite should be the base child of this tile
								var subTexture =  getAtlasSubtexture(overworldAtlasPath, tileMappings[tileFromServer.tileType]);

								if (subTexture != null) {
									tileSprite.texture = subTexture;
									mapContainer.addChild(tileSprite);
								}
							}
					}
				}
		}

	} else {
		console.log('overworld map data from remote is missing.');
	}

}

function objectClicked (object) {
	// console.log(object.name+" clicked");
	// object.x += 50;

	// renderer.render(stage);
}

function hideWindows() {

	for (win in htmlWindows) {
		console.log(win);
		$(htmlWindows[win]).hide();
	}
}

function toggleStatWinVisibility () {
	$(htmlWindows['statWindowId']).toggle();
}


function toggleIventoryWinVisibility () {
	$(htmlWindows['inventoryWindowId']).toggle();
}

function toggleConsoleVisibility () {
	$(htmlWindows['messageWindowId']).toggle();
}

function updateStatBar (statbar) {
 //	var valueBar = statbar.innerBar;

	//valueBar.beginFill(0x000000);
	//valueBar.drawRect(statbar.x, statbar.y, statbar.innerSizeX, statbar.innerSizeY);
	//valueBar.endFill();
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

function bindStageClick() {
	$('#main-window').on('click',
			function () {
				return stageClicked(renderer);
			}
		);
}

//data -- 'username':username,'sessionId':sid, 'character':thisPlayer
function handlePlayerLogin(data){
	renderer.render(stage); //finally draw the game stage for the user
	console.log(data);
	var playerStatus = data['player-status']

	//console.log(character);
	//Creates the new character to represent the player
	showMapPosition(playerStatus['pos_x'], playerStatus['pos_y']);
	newCharacterOnMap (playerStatus['charname'], playerStatus['pos_x'], playerStatus['pos_y']);
	bindStageClick(); //Activate movement click input
	console.log('Logged in! Welcome!');
}

function bindEvents () {
	 bindMessageButton(true);
}
