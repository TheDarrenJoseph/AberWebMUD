function updateInputField (character) {
    var inputField;
    inputField = $('#message-input');
    if (inputField.val.length === 0) {
      return inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
    } else {
      return $('#message-input .user-input').append(character.data);
    }
};

function setMessageLog (text) {
    return $('#message-log').val(text);
};

function updateMessageLog (msg) {
    var logVal;
    console.log("Received: " + msg['messageData']);
    logVal = $('#message-log').val();
    return $('#message-log').val(logVal + msg['messageData'] + '\n');
};

function clearMessageInputField () {
    return $('#message-input').val('');
};
var socket = null;

var clientSession = {
  username: null,
  character: {charname: null, posX: null, posY: null},
  sessionId: null
}

function sendNewChatMessage() {
  var userInput = $('#message-input').val();
	//console.log('message sent!: \''+userInput+'\'');
  if (userInput !== '') {
	   socket.emit('new-chat-message', {data: userInput});
  }
}

//Tries to send movement input for the current user
function sendMovementCommand(x,y) {
  var username = clientSession.username;
  var sessionId = clientSession.sessionId;

  if (username != null && sessionId != null) {
  	socket.emit('movement-command', {sessionId: sessionId, username: username, moveX: x, moveY: y});
  }
}

//Send the user's password to the sever
function sendAuthentication(username, passwordFieldVal){
  console.log('sending ' + username + ' ' + passwordFieldVal);
  clientSession.username = username;
  socket.emit('client-auth', {'username': username, 'password': passwordFieldVal});
}

//Save our given session id for later, and display the welcome message
function link_connection(data){
  if (clientSession.sessionId == null) {
    clientSession.sessionId = data['sessionId'];
    console.log('Handshaked with server, session ID given:' + clientSession.sessionId);
    setMessageLog(data['messageData']);
  } else {
    console.log('Reconnected, using old SID');
  }
}

function connectSocket() {
  socket = io.connect();
  //socket = io.connect('https://localhost');
}

function setupStatusUpdates (movementResponseCallback, movementUpdateCallback) {
    socket.on('movement-response', movementResponseCallback);
    socket.on('movement-update', movementUpdateCallback);
}

function saveMapUpdate (mapData) {
  overworldMap = JSON.parse(mapData['data']);
  overworldMapX = mapData['map-size-x'];
  overworldMapY = mapData['map-size-y'];
  console.log('MAP DATA RECEIVED');
  drawMapToGrid ();
}

function setupChat () {
	// Socket custom event trigger for message response, passing in our function for a callback
	socket.on('chat-message-response', updateMessageLog);
  socket.on('connection-response', link_connection);
  //socket.on('status-response', updateMessageLog);
  socket.on('map-data-response', saveMapUpdate);

  socket.on('request-password', requestUserPassword); //Request for existing password
  socket.on('request-new-password', requestUserPassword); //Request for new password

  //emit('login-success', userData['username'])
  socket.on('login-success', handlePlayerLogin);
}
var htmlWindows = {messageWindowId: '#message-window', statWindowId: '#stat-window', inventoryWindowId: '#inventory-window'};

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
var stage = new PIXI.Container();

var dialogContainer = new PIXI.Container();
var controlsContainer = new PIXI.Container();

// Using ParticleContainer for large amounts of sprites
var mapContainer = new PIXI.ParticleContainer();
var characterContainer = new PIXI.ParticleContainer();

var tileSpriteArray; //	Sprites for the map view
var mapCharacterArray; //	Sprites for the players in the current map view

stage.addChild(mapContainer);
stage.addChild(dialogContainer);
stage.addChild(controlsContainer);
stage.addChild(characterContainer);

var dialogBackground;

var tileSize = 40;
var thisPlayer;

// Set our mapWindowSize to the smallest of our page dimensions
// Using the smallest dimension to get a square
// Then use 90% of this value to leave some space
var mapWindowSize = window.innerWidth;
if (window.innerHeight < window.innerWidth) {
	mapWindowSize = window.innerHeight;
}

// tileCount is the number of tiles we can fit into this square area
// Rounding down (floor) to get a good tile count
var tileCount = Math.floor(mapWindowSize / tileSize);

mapWindowSize = tileCount * tileSize; // Update mapWindowSize to fit the tileCount snugly!
var halfMapWindowSize = Math.floor(mapWindowSize / 2);
var thirdMapWindowSize = Math.floor(mapWindowSize / 3);

//These are the start co-ords of our map window (tile view) to allow map scrolling
var mapGridStartX = 0;
var mapGridStartY = 0;

var overworldMap = [];
var overworldMapX = 0; //Sizes of the map
var overworldMapY = 0;

var gridCharacter = {
	charactername: null,
	posX: null,
	posY: null,
	sprite: null
};

function GridCharacter (charname, x, y, sprite) {
	return {
		charname: charname,
		posX: x,
		posY: y,
		sprite:sprite
	}
}


function getAtlasSubtexture(tileAtlasPath, subtileName) {
	var atlasTexture = PIXI.loader.resources[tileAtlasPath];

	//Check the texture
	if (atlasTexture  != null) {
		var subTexture = atlasTexture.textures[subtileName];

		if (subTexture != null) {
			return subTexture;
		} else {
			console.log('No tile atlas subtile (not in tile atlas JSON?): ' + subtileName);
		}

	} else {
		console.log('Error loading tile atlas (not known to loader?): ' + tileAtlasPath);
	}

	return null;
}

// Creates a new PIXI.Sprite from a tileset atlas loaded in by Pixi's resource loader
function makeSpriteFromAtlas (tileAtlasPath, subtileName) {
	var atlasTexture = PIXI.loader.resources[tileAtlasPath];

	//Check the texture
	if (atlasTexture  != null) {
		var subTexture = atlasTexture.textures[subtileName];

		if (subTexture != null) {
			var thisSprite =  new PIXI.Sprite(subTexture);
			thisSprite.height = tileSize;
			thisSprite.width = tileSize;
			return thisSprite;

		} else {
			console.log('No tile atlas subtile (not in tile atlas JSON?): ' + subtileName);
		}

	} else {
		console.log('Error loading tile atlas (not known to loader?): ' + tileAtlasPath);
	}

	return null;
}

function PlayerSprite () {
		return makeSpriteFromAtlas (characterAtlasPath, 'player');
}

function MapTileSprite (textureReference) {
	// var MapTileSprite = new PIXI.Sprite(PIXI.loader.resources[chestPath].texture);
	//var MapTileSprite = makeSpriteFromAtlas(overworldTilesetPath, 0, 0, 16, 16);
	//var MapTileSprite = makeSpriteFromAtlas(overworldAtlasPath, 'grass-plain');
	return makeSpriteFromAtlas (overworldAtlasPath, textureReference);
}

function StatBar (name, posX, posY) {
	this.name = name;
	this.backgroundBar = new PIXI.Graphics();
	this.innerBar = new PIXI.Graphics();

	this.innerSizeX = thirdMapWindowSize - 9;
	this.innerSizeY = tileSize / 3 - 6;
	this.value = 100;

	StatBar.prototype.drawBackgroundBar = function() {
		this.backgroundBar.beginFill(0x000000);
		this.backgroundBar.lineStyle(2, 0xFFFFFF, 1);

		this.backgroundBar = this.backgroundBar.drawRoundedRect(posX, posY, thirdMapWindowSize, tileSize / 2, 4);
		this.backgroundBar.endFill();
	}

	StatBar.prototype.drawInnerBar = function()  {
		this.innerBar.beginFill(0xFF0000);
		this.innerBar = this.innerBar.drawRoundedRect(posX + 6, posY + 6, this.innerSizeX, this.innerSizeY, 4);
		this.innerBar.endFill();
	}

	//	Sets a statbar's indicated value using a 1-100 value
	//	Returns true if changes made, false otherwise
	StatBar.prototype.setValue = function (value) {
		if (this.value == value) return false;

		if (value <= 100 && value >= 0) {
			this.value = value;
			this.innerSizeX = ((this.innerSizeX / 100) * value); //	Simple percentage adjustment for Y size

		} else return false;
	}
}

function isPositionRelativeToView(x,y) {
	//Check whether or not this position is a view-relative one using x/y from 0 - tileCount
	if (x <= tileCount-1 &&  x >= 0 &&  y <= tileCount-1 &&  y >= 0) {
		return true;
	} else {
		return false;
	}
}

function isPositionInMapView(x, y) {
	//Check whether or not the character is within our map view window
	if (x <= (mapGridStartX+tileCount) &&  x >= mapGridStartX &&  y <= (mapGridStartY + tileCount) &&  y >= mapGridStartY) {
		return true;
	} else {
		return false;
	}
}

function isPositionInOverworld(x, y) {
	if (x <= (overworldMapX) &&  x >= 0 &&  y <= (overworldMapY) &&  y >= 0) {
		return true;
	} else {
		return false;
	}
}

//	We only view the map through our view window,
//	This function adjusts the globalX to a value relative to the grid view
function globalTilePosToLocal(globalX, globalY) {
	return[0,0];

	if (isPositionInOverworld(globalX, globalY)) {
		if (isPositionInMapView(globalX, globalY)) return [globalX, globalY]; //	No change needed

		//Minus the start co-ord offset to reduce back to 0 indexing
		var thisX = globalX - mapGridStartX;
		var thisY = globalY - mapGridStartY;

		//if (x <= (mapGridStartX+tileCount) &&  x >= mapGridStartX &&  y <= (mapGridStartY + tileCount) &&  y >= mapGridStartY) {
		//}

		return [thisX,thisY];
	} else {
		return [0,0]; //return false instead for more clarity?
	}
}

//	Converts tile coords from 0,0 - X,X based on tilecount to a Pixi stage pixel position
//		-This takes a global position (say the map is 20 tiles, so from 0-19)
//		-that position is then converted to a pixel amount based:
//				--tile size
//				--how many tiles are in the UI
//				--where the view window is
//		-Returns an array of len 2 [x,y]
function coordToPixiPosition (x,y) {
	//Firstly we need to adjust for what tile the top-left of our view is on
	//This can then be used to

	//mapGridStartX - top-left index for where our view is globally
	//tileCount - the amount of tiles shown for x and y
	//overworldMapX - the actual tile size of the map

	if (!isPositionRelativeToView(x,y)) return; //Sanity check

	var offsetX = 0;
	var offsetY = 0;


	var posX = (x*tileSize)
	var posY = (y*tileSize)

	console.log('Tilesize: '+tileSize+'Co-ord pos: '+x+' '+y+'\n'+'Pixi pos: '+posX+' '+posY);

	return [posX, posY];
}

function pixiPosToTileCoord (x,y) {
	var clientX = Math.floor(x / tileSize);
	var clientY = Math.floor(y / tileSize);

	var zeroIndexedTileCount = tileCount - 1;

	// Sanity check to make sure we can't click over the boundary
	if (clientX > zeroIndexedTileCount) clientX = zeroIndexedTileCount;
	if (clientY > zeroIndexedTileCount) clientY = zeroIndexedTileCount;

	console.log('PIXI pos: '+x+' '+y+'\n'+'Tile pos: '+clientX+' '+clientY);

	return{'x':clientX,'y':clientY}
}

//Moves the UI to a new position and draws the map there
function showMapPosition(gridX,gridY){
	if (isPositionInOverworld(gridX, gridY)) {
		mapGridStartX = gridX;
		mapGridStartY = gridY;

		drawMapToGrid (gridX, gridY); //Draw the view at this position
	}
}
var titleText = 'AberWebMUD';
var zeldaAssetPath = 'static/assets/gfx/';
var overworldAtlasPath = zeldaAssetPath + 'overworld-texture-atlas.json';
var zeldaObjectsAtlasPath = zeldaAssetPath + 'zelda-objects-texture-atlas.json';
var characterAtlasPath = zeldaAssetPath + 'character-texture-atlas.json';


var tileMappings = ['grass-plain', 'barn-front'];

// Set our mapWindowSize to the smallest of our page dimensions
// Using the smallest dimension to get a square
// Then use 90% of this value to leave some space
mapWindowSize = window.innerWidth;

if (window.innerHeight < window.innerWidth) {
	mapWindowSize = window.innerHeight;
}

// resolution 1 for now as default (handles element scaling)
var renderingOptions = {
	resolution: 1
};

// Create our PixiJS renderer space
// var renderer = PIXI.autoDetectRenderer(500, 500, renderingOptions);
var renderer = PIXI.autoDetectRenderer(mapWindowSize, mapWindowSize);
renderer.autoresize = true;

// 	1. Allocates a tile array for the map view and character views,
//	2. creates sprites for each array space
//	3. adds each of these sprites to our mapContainer
//	returns the final array
function setupMapUI () {
	var tileSpriteArray = Array(tileCount);
	var tileSprite;

	for (var x = 0; x < tileCount; x++) {
		tileSpriteArray[x] = Array(tileCount); // 2nd array dimension per row
		for (var y = 0; y < tileCount; y++) {
			tileSpriteArray[x][y] = MapTileSprite('grass-plain'); // Allocate a new tile
			tileSprite = tileSpriteArray[x][y]; // Reference to new tile in the array

			// tileSprite.anchor.x = x*tileSize;
			// tileSprite.anchor.y = y*tileSize;
			tileSprite.position.x = x * tileSize;
			tileSprite.position.y = y * tileSize;
			tileSprite.interactive = true;
			tileSprite.name = '' + x + '' + y;

			mapContainer.addChild(tileSprite);
			// tileSprite.click = function() {return objectClicked(tileSprite);}
		}
	}

	return tileSpriteArray;
}

function drawMapCharacterArray () {
	for (var x = 0; x < tileCount; x++) {
		for (var y = 0; y < tileCount; y++) {
			var thisCharacter = mapCharacterArray[x][y];

			if (thisCharacter != null && thisCharacter.sprite != null) {
				console.log('drawing tile..');
				characterContainer.addChild(thisCharacter.sprite);

			}
		}
	}

	renderer.render(stage);
}

//	Creates an empty 2D array to store players in our view
function createMapCharacterArray () {
	var mapCharacterArray = Array(tileCount);
	for (var x = 0; x < tileCount; x++) {
		mapCharacterArray[x] = Array(tileCount); // 2nd array dimension per row
	}

	return mapCharacterArray;
}

function createSprite(atlasPath, subtileName, tileHeight, tileWidth, x, y, interactive) {
	var thisSprite = makeSpriteFromAtlas(atlasPath, subtileName);

	thisSprite.height = tileHeight;
	thisSprite.width = tileWidth;

	thisSprite.x = x;
	thisSprite.y = y;

	thisSprite.interactive = interactive;
	return thisSprite;
}

function setupConsoleButton () {
	//	var consoleButtonSprite = makeSpriteFromTileset(zeldaObjectsTilesetPath, 0, 16, 16, 16);
	//	var consoleButtonSprite = PIXI.Sprite.fromImage(zeldaAssetPath+'chat-bubble-blank.png');
	var consoleButtonSprite = createSprite(	zeldaObjectsAtlasPath,
																					'chat-bubble-blank',
																					tileSize,
																					tileSize,
																					0 ,
																					mapWindowSize - tileSize,
																					true);

	controlsContainer.addChild(consoleButtonSprite);
	consoleButtonSprite.on ('click', toggleConsoleVisibility);
}

function setupContextButtons () {
	//	var inventoryButtonSprite = makeSpriteFromTileset(zeldaObjectsTilesetPath, 0, 0, 16, 16);
	var inventoryButtonSprite = createSprite(	zeldaObjectsAtlasPath,
																						'chest-single',
																						tileSize,
																						tileSize*2,
																						mapWindowSize - (tileSize * 2),
																						mapWindowSize - tileSize,
																						true
																					);


	controlsContainer.addChild(inventoryButtonSprite);
	inventoryButtonSprite.on ('click', toggleIventoryWinVisibility);

	var statsButtonSprite = createSprite(	zeldaObjectsAtlasPath,
																				'chest-single',
																				tileSize,
																				tileSize*2,
																				mapWindowSize - tileSize*4,
																				mapWindowSize - tileSize,
																				true
																			);

	controlsContainer.addChild(statsButtonSprite);
	statsButtonSprite.on ('click', toggleStatWinVisibility);

	renderer.render(stage);

	return[inventoryButtonSprite,statsButtonSprite];
}

function setupDialogWindow () {
	dialogBackground = new PIXI.Graphics();

	dialogBackground.beginFill(0xFFFFFF);
	dialogBackground.lineStyle(2, 0x000000, 1);
	dialogBackground.drawRect(halfMapWindowSize/2, halfMapWindowSize/2, halfMapWindowSize, halfMapWindowSize);
	dialogBackground.endFill();
	dialogBackground.visible = false; //Hidden until we need it

	dialogContainer.addChild(dialogBackground);

	dialogContainer.overflow = 'scroll';
}

//	Creates the needed stat bars
//	Returns an array of these statbars for later adjustment
function setupStatBars () {
	var healthBar = new StatBar('health-bar', mapWindowSize - thirdMapWindowSize - 2, 0);

	controlsContainer.addChild(healthBar.backgroundBar);
	controlsContainer.addChild(healthBar.innerBar);
	//	dialogBackground.visible = false; //Hidden until we need it

	return [healthBar];
}


//Creates a character sprite on-the-fly to represent another character
//gridX, gridY are character positions on the map
function newCharacterOnMap (charactername, gridX, gridY) {
	console.log('new char.. ' + charactername + gridX + gridY);
	if (!isPositionInOverworld(gridX, gridY)) return; //	Do nothing if the coordinates don't exist on the map

	//Convert global co-ords to local view ones so we can modify the UI
	var localPos = globalTilePosToLocal(gridX, gridY);
	var localX = localPos[0];
	var localY = localPos[1];

	console.log('new char at:'+localX+' '+localY);

	if (isPositionRelativeToView(localX, localY)) {
			var characterSprite = makeSpriteFromAtlas(characterAtlasPath, 'player');

			var pixiPos = coordToPixiPosition(localX, localX);
			console.log('PIXI POS for new char: '+pixiPos[0]+' '+pixiPos[1]);
			characterSprite.x = pixiPos[0];
			characterSprite.y = pixiPos[1];
			characterContainer.addChild(characterSprite);

			renderer.render(stage);

			//console.log(mapCharacterArray);
			// mapCharacterArray

			mapCharacterArray[localX][localY] = new GridCharacter(charactername, pixiPos[0], pixiPos[1], characterSprite);

			console.log('new char at:');
			console.log(mapCharacterArray[localX][localY]);

			drawMapCharacterArray ();

			return characterSprite;
	} else {
		console.log('New player not in our view at this position: ' + gridX + ' ' + gridY);
	}

	return false;
}

function updateCharacterSpritePos(oldX, oldY, x, y) {
	var sprite = mapCharacterArray[oldX][oldY];

	if (sprite != null){
		var characterPos = coordToPixiPosition(x, y);
		sprite.x = characterPos[0];
		sprite.y = characterPos[1];
		characterContainer.addChild(sprite);
	}
}

function assetsLoaded () {
	// Check that WebGL is supported and that we've managed to use it
	var rendererType;
	if (PIXI.utils.isWebGLSupported() && (renderer instanceof PIXI.WebGLRenderer)) {
		rendererType = 'WebGL';
	} else { rendererType = 'Canvas'; }

	console.log('Using renderer option: ' + rendererType);

	// document.body.appendChild(renderer.view);
	$('#main-window').append(renderer.view);

	// console.log ("Using grid size of "+mapWindowSize);

	setupDialogWindow();
	mapCharacterArray = createMapCharacterArray();

	var statBars = setupStatBars();
	console.log(statBars);
	statBars[0].setValue(20);
	statBars[0].drawBackgroundBar();
	statBars[0].drawInnerBar();

	tileSpriteArray = setupMapUI();
	console.log(tileSpriteArray );

	  drawMapToGrid();

	$('console-button').append(contextButtons);

	setupConsoleButton();
	var contextButtons = setupContextButtons();

	hideWindows();

	//renderer.render(stage);
}

function setupPageUI() {
	//$('#message-window').hide();

	// Arbitrary assignment of message log window size for now
	//$('#message-log').rows = 5;
	//$('#message-log').cols = 100;
	$('#message-log').val('');
	$('#password-input').hide();

	// Callback for after assets have loaded (for drawing)
	PIXI.loader.add([overworldAtlasPath,
									zeldaObjectsAtlasPath,
									characterAtlasPath]).load(assetsLoaded);

	bindEvents();
}
