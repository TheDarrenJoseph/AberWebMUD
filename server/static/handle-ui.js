function stageDoubleClicked (mouseEvent) {
	if (renderer.plugins.interaction.pointer.originalEvent.type === 'pointerdown') {
		console.log('movement click!');
		var coords = pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY);
		sendMovementCommand(coords['x'], coords['y']);
	}
}

function stageClicked (renderer) {
	var mouseEvent = renderer.plugins.interaction.pointer.originalEvent;
	//console.log(pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY));
	setTimeout(function () { return stageDoubleClicked(mouseEvent); }, 150);
}

//tileSpriteArray -- the grid array of sprites available to the UI
//mapData -- the JSON response from the server describing the area
function drawMapToGrid () {
	console.log('drawing map to grid: '+overworldMap.length);

	//Check there's at least enough tiles to fill our grid
	if (overworldMap.length >= tileCount) {
		for (var x = 0; x < tileCount; x++) {
			for (var y = 0; y < tileCount; y++) {
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
	} else {
		console.log('overworld map data from remote is missing.');
	}

}

function objectClicked (object) {
	// console.log(object.name+" clicked");
	// object.x += 50;

	// renderer.render(stage);
}

function toggleConsoleVisibility () {
	$(messageWindowId).toggle();
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

function pixiPosToTileCoord (x,y) {
	var clientX = Math.floor(x / tileSize);
	var clientY = Math.floor(y / tileSize);

	var zeroIndexedTileCount = tileCount - 1;

	// Sanity check to make sure we can't click over the boundary
	if (clientX > zeroIndexedTileCount) clientX = zeroIndexedTileCount;
	if (clientY > zeroIndexedTileCount) clientY = zeroIndexedTileCount;

	return{'x':clientX,'y':clientY}
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

//Converts tile coords from 0,0 - X,X based on tilecount to a Pixi stage pixel position
//Returns an array of len 2 [x,y]
function coordToPixiPosition (x,y) {
	var posX = x*tileSize-tileSize;
	var posY = y*tileSize-tileSize;
	return [posX, posY];
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
	var character = data['character'];
	console.log(character);
	newCharacterOnMap (character['charname'], character['pos_x'], character['pos_y']);
	//bindStageClick();
	console.log('Logged in! Welcome!');
	renderer.render(stage);
}

function bindEvents () {
	 bindMessageButton(true);
}
