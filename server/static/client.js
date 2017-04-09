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
      if (messageJson['success'] == true) characterDetailsConfirmed();
    } else {
      console.log('Updating existing details.. ');
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
function updateInputField (character) {
    var inputField;
    inputField = $('#message-input');
    if (inputField.val.length === 0) {
      return inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
    } else {
      return $('#message-input.user-input').append(character.data);
    }
};

function setMessageLog (text) {
    return $('#message-log').val(text);
};

//Updates the input field using the message and username strings
function updateMessageLog (msg, username) {
    var logVal;
    logVal = $('#message-log').val();

    if (username != null && username != undefined) msg = '['+username+'] '+ msg; //Add a user tag to the message

    $('#message-log').val(logVal + msg + '\n');
};

function clearMessageInputField () {
    return $('#message-input').val('');
};

//2 arrays of the same length to allow looping for creating each line of the table
var attributeNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
var numberInputIds = ['strNumber', 'dexNumber', 'conNumber', 'intNumber', 'wisNumber', 'chaNumber'];
var minAttributeVal = 1;
var maxAttributeVal = 100;

function createSelectorOption(tagValue,text) {
  var classSelector = document.createElement('option');
  classSelector.setAttribute('value', tagValue);
  classSelector.append(document.createTextNode(text));

  return classSelector;
}

//Generates the attribute rows and appends them to the given table element
function createTableRows(statsTable){
  for (var i=0; i<attributeNames.length; i++) {
    var attributeRow = document.createElement('tr');
    var attributeNameElem = document.createElement('td');
    attributeNameElem.append(document.createTextNode(attributeNames[i]));

    var attributeValElem = document.createElement('td');

    var attributeValInput = document.createElement('input');
    attributeValInput.setAttribute('class','attrVal');
    attributeValInput.setAttribute('type', 'number');
    attributeValInput.setAttribute('value', 1);
    attributeValInput.setAttribute('id', numberInputIds[i]);
    attributeValInput.setAttribute('min', minAttributeVal);
    attributeValInput.setAttribute('max', maxAttributeVal);
    attributeValElem.append(attributeValInput);

    attributeRow.append(attributeNameElem);
    attributeRow.append(attributeValElem);

    statsTable.append(attributeRow);
  }
}

function createStatsTable(){
  var statsTable = document.createElement("table");
  statsTable.setAttribute('id', 'stat-table');

  var statsTableHeaderRow = document.createElement('tr');
  var statsTableLeftHeader = document.createElement('th');
  statsTableLeftHeader.append(document.createTextNode('Attributes'));
  var statsTableRightHeader = document.createElement('th');
  statsTableHeaderRow.append(statsTableLeftHeader);
  statsTableHeaderRow.append(statsTableRightHeader);

  statsTable.append(statsTableHeaderRow);

  createTableRows(statsTable);

  return statsTable;
}

function clearStatInfo(){
  $('#stats-info').val(''); //JQuery find the field and set it to blank
}

function addToStatInfo(message){
  var statsField = $('#stats-info');
  statsField.val(statsField.val()+message);
}

function generateStatWindow() {
  //Form div to append our elements to
  var form = document.createElement("form");

  //'Character Name' section
  var nameLabel = document.createElement("p");
  nameLabel.setAttribute('class', 'classLabel');
  nameLabel.append(document.createTextNode("Character Name"));

  var nameInput = document.createElement("input");
  nameInput.setAttribute('type', 'text');
  nameInput.setAttribute('id', 'char-name-input');
  nameInput.setAttribute('required', 'required');
  nameInput.setAttribute('pattern','[\\w]{1,12}');
  nameInput.setAttribute('Title','1-12 characters using: a-Z, 0-9, and _');

  //'Character Class' section
  var classLabel = document.createElement("p");
  classLabel.setAttribute('class', 'classLabel');
  classLabel.append(document.createTextNode("Character Class"));
  //Dropdown for class type
  var classSelector = document.createElement("select");
  classSelector.setAttribute('id', 'class-selection');
  classSelector.setAttribute('disabled', true);
  classSelector.append(createSelectorOption('fighter','Fighter'));
  classSelector.append(createSelectorOption('spellcaster','Spellcaster'));

  //'Attributes' section
  var statsTable = createStatsTable();

  //This allows displaying any needed info
  var statsInfo = document.createElement("textarea");
  statsInfo.setAttribute('id', 'stats-info');

  var saveButton = document.createElement("input");
  saveButton.setAttribute('type', 'submit');
  saveButton.setAttribute('id', 'save-stats-button');
  saveButton.setAttribute('value','Save');

  form.setAttribute('onsubmit', 'return false');
  form.append(nameLabel);
  form.append(nameInput);
  form.append(classLabel);
  form.append(classSelector);
  form.append(statsTable);
  form.append(statsInfo);
  form.append(saveButton);

  return form;
}

//Brings up the stats window
function showStatWindow() {
  showWindow('statWindowId');
}

function getStatsCharacterName(){
  return $('#char-name-input').val();
}

function setStatsCharacterName(name){
  $('#char-name-input').val(name);
}

function getStatsCharacterClass(){
  return $('#class-selection').val();
}

function setStatsCharacterClass(selectionNo){
  var options = $('#class-selection').find('option');
  var optionsLen = options.length;

  if (selectionNo > 0 && selectionNo < optionsLen) {
    var optionChoice = options[selectionNo].value; //Choice id e.g 'spellcaster'
    $('#class-selection').val(optionChoice); //Set the value
  }

}

function getStatsAttributeValues(){
  var output = {};

  for (var i=0; i<numberInputIds.length; i++) {
    var statId = '#'+numberInputIds[i];
    var statValue = $(statId).val();
    output[attributeNames[i]] = statValue;
  }

  return output;
}

//Grabs Character Name, Class, and Attribute values
function getStats() {
  return { 'charname' : getStatsCharacterName(),
          'charclass' : getStatsCharacterClass(),
          'attributes' : getStatsAttributeValues()
        }
}

//Takes a JSON object of form: {'STR':1,'DEX':2,...} and sets the value fields to match
function setStatsAttributeValues(attrValuesJSON){
  for (var i=0; i<numberInputIds.length; i++) {
    var statId = '#'+numberInputIds[i];
    var inputVal = attrValuesJSON[attributeNames[i]];
    var statValue = $(statId).val(inputVal);
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

			tileSprite.position.x = x * tileSize;
			tileSprite.position.y = y * tileSize;
			tileSprite.interactive = true;
			tileSprite.name = '' + x + '' + y;

			mapContainer.addChild(tileSprite);
		}
	}

	return tileSpriteArray;
}

function drawMapCharacterArray () {
	characterContainer.removeChildren();

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

	var statsButtonSprite = createSprite(	zeldaObjectsAtlasPath,
																				'chest-single',
																				tileSize,
																				tileSize*2,
																				mapWindowSize - tileSize*4,
																				mapWindowSize - tileSize,
																				true
																			);

	controlsContainer.addChild(statsButtonSprite);
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

	return [healthBar];
}

function displayHealthBar() {
		var statBars = setupStatBars();
		console.log(statBars);
		statBars[0].setValue(20);
		statBars[0].drawBackgroundBar();
		statBars[0].drawInnerBar();
}

//Shows just the controls needed for login
function showLoginControls() {
	hideWindows();
	toggleConsoleVisibility(); //Make the console only visisble
	setTimeout(function () { return checkConnection(); }, 5000); //Check connection every 5 seconds
}

function setupUI() {
	setupDialogWindow();
	mapCharacterArray = createMapCharacterArray();

	displayHealthBar();

	tileSpriteArray = setupMapUI();

	$('#console-button').append(contextButtons);

	setupConsoleButton();
	var contextButtons = setupContextButtons();

	contextButtons[0].on ('click', toggleIventoryWinVisibility);
	contextButtons[1].on ('click', toggleStatWinVisibility);
}

function assetsLoaded () {
	// Check that WebGL is supported and that we've managed to use it
	var rendererType;
	if (PIXI.utils.isWebGLSupported() && (renderer instanceof PIXI.WebGLRenderer)) {
		rendererType = 'WebGL';
	} else { rendererType = 'Canvas'; }

	console.log('Using renderer option: ' + rendererType);

	$('#main-window').append(renderer.view);

	setupUI();
	showLoginControls();
}

function setupPageUI() {
	$('#message-log').val('');
	$('#password-input').hide();

	var statWindowDiv = generateStatWindow();
	$('#stat-window').append(statWindowDiv);

	bindEvents(); //	Hookup message sending and other controls

	// Callback for after assets have loaded (for drawing)
	PIXI.loader.add([overworldAtlasPath,
									zeldaObjectsAtlasPath,
									characterAtlasPath]).load(assetsLoaded);
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

//Handles a movement
// 'movement-update', {'username':message['username'],'oldX':oldX, 'oldY':oldY,'pos_x':pos_x,'pos_y':pos_y}
function handleMovementUpdate (updateJSON) {
    var username = updateJSON['username'];
    var old_x = updateJSON['old_x'];
    var old_y = updateJSON['old_y'];
    var pos_x = updateJSON['pos_x'];
    var pos_y = updateJSON['pos_y'];

    if (isValidMovementUpdateData(updateJSON)) {
      //If it's the player, follow them with the view
      if (username == clientSession.username) {
        showMapPosition(pos_x,pos_y);
      }

      console.log('A character has moved.. \nUser:' + username + ' to ' + pos_x + ' ' + pos_y);
      //updateCharacterSpritePos(username, old_x, old_y, pos_x, pos_y);
      newCharacterOnMap (username, pos_x, pos_y);

    } else {
      throw new Error('Missing movement update data '+JSON.stringify(updateJSON));
    }
}

//function deleteMapCharacter(global_x, global_y) {
//  //Converting global pos to local relative to view
//  var localOldPos = globalTilePosToLocal(global_x, global_y);
//  var old_sprite = mapCharacterArray[localOldPos[0]][localOldPos[1]];

//  if (old_sprite != null) {
//    characterContainer.removeChild(old_sprite); //Ask pixiJS to remove this sprite from our container
//    renderer.render(stage);
//  } else {
//    throw new Error('Expected sprite to remove, null found! at: ' + localOldPos[0] + ' ' + localOldPos[1]);
//  }
//}

//Creates a character sprite on-the-fly to represent another character
//gridX, gridY are character positions on the map
function newCharacterOnMap (charactername, gridX, gridY) {
	console.log('new char.. ' + charactername + gridX + gridY);

	if (!isPositionInOverworld(gridX, gridY)) {
		console.log('bad pos: '+gridX+' '+gridY);
		return false; //	Do nothing if the coordinates don't exist on the map
	} else {
		//Convert global co-ords to local view ones so we can modify the UI
		var localPos = globalTilePosToLocal(gridX, gridY);
		var localX = localPos[0];
		var localY = localPos[1];

		if (isPositionRelativeToView(localX, localY)) {
				var characterSprite = makeSpriteFromAtlas(characterAtlasPath, 'player');
				var pixiPos = tileCoordToPixiPos(localX,localY);

				console.log('PIXI POS for new char: '+pixiPos[0]+' '+pixiPos[1]);
				characterSprite.x = pixiPos[0];
				characterSprite.y = pixiPos[1];

				mapCharacterArray[localX][localY] = new GridCharacter(charactername, gridX, gridY, characterSprite);

				drawMapCharacterArray ();

				return characterSprite;
		} else {
			console.log('New player not in our view at this position: ' + gridX + ' ' + gridY);
		}

		return false;
	}

}

// function updateCharacterSpritePos(charname, old_x_global, old_y_global, new_x_global, new_y_global) {
// 	console.log('OLDX: '+old_x_global);
// 	console.log('OLDY: '+old_y_global);
// 	console.log('X: '+new_x_global);
// 	console.log('Y: '+new_y_global);
//
// 	if (isPositionInOverworld(old_x_global, old_y_global) && isPositionInOverworld(new_x_global, new_y_global)) {
// 		//Have they only moved within the screen?
// 		if (isPositionInMapView(old_x_global, old_y_global)) {
// 			//Moves the sprite to the new position
// 			if (isPositionInMapView(new_x_global, new_y_global)) {
// 				//var localNewPos = globalTilePosToLocal(new_x_global, new_y_global);
// 				console.log('Moving '+charname+'!');
//
// 				newCharacterOnMap (charname, new_x_global, new_y_global);
//
// 			} else {
// 				console.log(charname+' walked out of view!'); //Moved out of screen
// 			}
//
//       deleteMapCharacter(old_x_global,old_y_global); //Delete the old sprite
//
// 		} else if (isPositionInMapView(new_x_global, new_y_global)) { //Moved into screen from
// 			newCharacterOnMap (charname, new_x_global, new_y_global); //Create a sprite to show them!
// 			console.log(charname+' has walked into view!');
// 		}
// 	}
// }
var stage = new PIXI.Container();

var dialogContainer = new PIXI.Container();
var controlsContainer = new PIXI.Container();

// Using ParticleContainer for large amounts of sprites
var mapContainer = new PIXI.ParticleContainer();
var characterContainer = new PIXI.ParticleContainer();

var tileSpriteArray; //	Sprites for the map view
var mapCharacterArray = createMapCharacterArray(); //	Sprites for the players in the current map view

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
var halfTileCountFloored = Math.floor(tileCount / 2);
var halfTileCountCeiled = Math.ceil(tileCount / 2);

if (tileCount%2 == 0) tileCount--; //Ensure we have an even tileCount


mapWindowSize = tileCount * tileSize; // Update mapWindowSize to fit the tileCount snugly!
var halfMapWindowSize = Math.floor(mapWindowSize / 2);
var thirdMapWindowSize = Math.floor(mapWindowSize / 3);

//These are the start co-ords of our map window (tile view) to allow map scrolling
var mapGridStartX = 0;
var mapGridStartY = 0;

var overworldMap = [];
var overworldMapSizeX = 0; //Sizes of the map
var overworldMapSizeY = 0;

var gridCharacter = {
	charactername: null,
	pos_x: null,
	pos_y: null,
	sprite: null
};

function GridCharacter (charname, x, y, sprite) {
	if (!isPositionInOverworld(x, y)) throw new RangeError('Invalid position for GridCharacter! (must be valid overworld co-ord)');
	return {
		charname: charname,
		pos_x: x,
		pos_y: y,
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



function StatBar (name, pos_x, pos_y) {
	this.name = name;
	this.backgroundBar = new PIXI.Graphics();
	this.innerBar = new PIXI.Graphics();

	this.innerSizeX = thirdMapWindowSize - 9;
	this.innerSizeY = tileSize / 3 - 6;
	this.value = 100;

	StatBar.prototype.drawBackgroundBar = function() {
		this.backgroundBar.beginFill(0x000000);
		this.backgroundBar.lineStyle(2, 0xFFFFFF, 1);

		this.backgroundBar = this.backgroundBar.drawRoundedRect(pos_x, pos_y, thirdMapWindowSize, tileSize / 2, 4);
		this.backgroundBar.endFill();
	}

	StatBar.prototype.drawInnerBar = function()  {
		this.innerBar.beginFill(0xFF0000);
		this.innerBar = this.innerBar.drawRoundedRect(pos_x + 6, pos_y + 6, this.innerSizeX, this.innerSizeY, 4);
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



function setMapViewPosition(startX,startY) {
//	var halfTileCount = (tileCount/2); //Always show a position in the middle of the view
	var halfViewMinus = 0-halfTileCountFloored;
	var end_view_x = overworldMapSizeX-halfTileCountFloored;
	var end_view_y = overworldMapSizeY-halfTileCountFloored;

	//if (isPositionInOverworld(startX, startY)) {
	//Checks that we have half the view out of the map maximum
	if (startX >= halfViewMinus && startX <= end_view_x && startY >= halfViewMinus && startY <= end_view_y) {
		//Adjusting the start values for drawing the map
		mapGridStartX = startX;
		mapGridStartY = startY;
	} else {
		throw new RangeError('Position not in overworld: '+startX+' '+startY);
	}
}

//Moves the UI to a new position and draws the map there
function showMapPosition(gridX,gridY){
	//This will throw a RangeError if our position is invalid (doubles as a sanity-check)
	setMapViewPosition(gridX - halfTileCountFloored,gridY - halfTileCountFloored);
	console.log('Drawing map from this position: '+gridX+' '+gridY);
	drawMapToGrid (gridX, gridY); //Draw the view at this position
}
function bindEvents () {
	 bindMessageButton(true);
	 bindSaveCharacterDetails();
}

function bindSaveCharacterDetails() {
	$('#save-stats-button').click(function(){sendCharacterDetails()});
}

function stageClicked (renderer) {
	var mouseEvent = renderer.plugins.interaction.pointer.originalEvent;
	//	console.log(pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY));
	setTimeout(function () { return stageDoubleClicked(mouseEvent); }, 150);
}

function stageDoubleClicked (mouseEvent) {
	if (renderer.plugins.interaction.pointer.originalEvent.type === 'pointerdown') {
		console.log('movement click!');

		try {
		var coords = pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY);
		coords = localTilePosToGlobal (coords[0], coords[1]);

		console.log('GLOBAL POSITION CLICKED: '+coords);

		sendMovementCommand(coords[0], coords[1]);
	} catch (err) { //Invalid tile position clicked on, do nothing
		return;
	}
	}
}

//Binds 'Enter' to send message behavior
function enterKeySendMessage(username){
	var messageField = $('#message-input');
	var passwordField = $('#password-input');
	messageField.unbind('keyup'); //Clear previous bindings first
	passwordField.unbind('keyup');

	messageField.on('keyup', function (evnt) {
		if (evnt.keyCode == 13) { //Enter key check
				console.log('ENTER on messagefield');
				sendNewChatMessage();
				clearMessageInputField();
		}
	});

	passwordField.on('keyup', function (evnt, username) {
		if (evnt.keyCode == 13) { //Enter key check
				console.log('ENTER on passwordfield');
				sendPassword(username);
		}
		});

}

//Switches the 'Send' message behavior from message to password sending
function bindMessageButton(isText){
	var thisButton = $('#send-message-button');
	thisButton.unbind('click');
	enterKeySendMessage(clientSession.username); //	Bind the enter key too

	if(isText) {
		thisButton.click(
				function() {
					sendNewChatMessage();
					clearMessageInputField();
				}
		);
	} else {
		//Only bind password sending if the expected (current) username is set
		if (clientSession.username != null) {
			thisButton.click (function () { sendPassword(clientSession.username); });
		}
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
	showControls (false); //	Hides major controls
	renderer.render(stage); // Re-renders the stage to show blank
}

function enableUI() {
	bindStageClick(true); //	Activate movement click input
	showControls (true); //	Shows major controls
	renderer.render(stage); // Re-renders the stage to show blank
}
//Local data stored for your current character
var charData = {
  charname: null, pos_x: null, pos_y: null, attributes: null, class: null, health: null
};

var clientSession = {
  username: null,
  character: charData,
  sessionId: null
};

function characterDetailsExist () {
  if (clientSession.character == null ||
      clientSession.character.charname == null ||
      clientSession.character.attributes == null ||
      clientSession.character.class == null ||
      clientSession.character.health == null) {
         return false;
  } else {
    return true;
  }
}


//Extracts the session data into a JSON object
function getSessionInfoJSON() {
  var username = clientSession.username;
  var sessionId = clientSession.sessionId;

  return {sessionId: sessionId, username: username}
}

function updateClientSessionData(data){
	var playerStatus = data['player-status'];
	console.log('Login data received: ');
	console.log(data);

	//	Update the client session to contain our new data
	clientSession.sessionId = data['sessionId'];

	clientSession.username = playerStatus['username'];
	clientSession.character.charname = playerStatus['charname'];
	clientSession.character.pos_x = playerStatus['pos_x'];
	clientSession.character.pos_y = playerStatus['pos_y'];

	console.log('Saved session object: ');
	console.log(clientSession);
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

function saveMapUpdate (mapData) {
  overworldMap = JSON.parse(mapData['data']);
  overworldMapSizeX = mapData['map-size-x'];
  overworldMapSizeY = mapData['map-size-y'];
  console.log('MAP DATA RECEIVED');
}

function handleSessionError () {
  console.log('Session Error!');
}
//Check whether or not this position is a view-relative one using x/y from 0 - tileCount
function isPositionRelativeToView(x,y) {
	if (x < tileCount &&  x >= 0 &&  y < tileCount &&  y >= 0) return true;
	return false;
}

	//Check whether or not a GLOBAL POSITION is within our map view window
function isPositionInMapView(global_x, global_y) {
	if (global_x < (mapGridStartX+tileCount) &&  global_x >= mapGridStartX &&  global_y < (mapGridStartY + tileCount) &&  global_y >= mapGridStartY) {
		return true;
	} else {
		return false;
	}
}

// Checks whether the position is valid in the range of 0 - < mapSizeXorY
function isPositionInOverworld(global_x, global_y) {
	// < for max range as overworldMapSizes are 1 indexed
	if (global_x < overworldMapSizeX &&  global_x >= 0 &&  global_y < overworldMapSizeY &&  global_y >= 0) {
		return true;
	} else {
		return false;
	}
}

//	We only view the map through our view window,
//	This function adjusts a local position 0-tileCount (window co-ord), to a real position on the map
function localTilePosToGlobal (localX, localY) {

	//	Ensure these are view tile co-ordinates
	if (!isPositionRelativeToView(localX,localY)) {
		 throw new RangeError('Local tile pos for conversion not relative to the map view');
	} else {
		//Shift each of these positions by the starting position of our map view
		localX += mapGridStartX;
		localY += mapGridStartY;

		//Double check we're returning a sane overworld position
		if (!isPositionInOverworld(localX, localY)) {
			throw new RangeError ('Local tile pos for conversion plus offset, not in the overworld.');
		} else {
			return [localX, localY];
		}
	}

}


//	We only view the map through our view window,
//	This function adjusts the global position (with relative offset) to a value relative to the grid view
function globalTilePosToLocal(globalX, globalY) {
	if (!isPositionInOverworld(globalX, globalY)) {
		throw new RangeError('Global tile pos for conversion not in the overworld');
	} else {
		if (globalX < mapGridStartX || globalY < mapGridStartY || globalX > mapGridStartX+tileCount || globalY > mapGridStartY+tileCount) throw new RangeError('Global tile pos for conversion not in the local view');
		return [globalX - mapGridStartX, globalY - mapGridStartY];
	}
}

//	Converts tile coords from 0,0 - X,X based on tilecount to a Pixi stage pixel position
//		-This takes a global position (say the map is 20 tiles, so from 0-19)
//		-that position is then converted to a pixel amount based:
//				--tile size
//				--how many tiles are in the UI
//				--where the view window is
//		-Returns an array of len 2 [x,y]m there
function tileCoordToPixiPos (x_relative,y_relative) {
	if (!isPositionRelativeToView(x_relative,y_relative)) throw new RangeError('Tile-to-Pixi conversion, tile position invalid!'); //Sanity check

	var pos_x = (x_relative*tileSize);
	var pos_y = (y_relative*tileSize);

	console.log('Tilesize: '+tileSize+'Co-ord pos: '+x_relative+' '+y_relative+'\n'+'Pixi pos: '+pos_x+' '+pos_y);

	return [pos_x, pos_y];
}

function pixiPosToTileCoord (x,y) {
	//Sanity check for input co-ords
	var furthestPos = tileSize*tileCount;
	if (x < 0 || x > furthestPos || y < 0 || y > furthestPos) throw new RangeError('Pixi-to-Tile conversion, pixi position invalid!');

	//Round down so clicks on the upper-half of tiles still convert correctly
	var clientX = Math.floor(x / tileSize);
	var clientY = Math.floor(y / tileSize);

	// Sanity check to make sure we can't click over the boundary
	var zeroIndexedTileCount = tileCount - 1;
	if (clientX > zeroIndexedTileCount) clientX = zeroIndexedTileCount;
	if (clientY > zeroIndexedTileCount) clientY = zeroIndexedTileCount;

	console.log('PIXI pos: '+x+' '+y+'\n'+'Tile pos: '+clientX+' '+clientY);

	return[clientX,clientY]
}
function isValidMovementUpdateData(updateJSON) {
  var username = updateJSON['username'];
  var oldX = updateJSON['old_x'];
  var oldY = updateJSON['old_y'];
  var pos_x = updateJSON['pos_x'];
  var pos_y = updateJSON['pos_y'];

  if (username != null &&
      username != undefined  &&
      oldX != null &&
      oldX != undefined  &&
      oldY != null &&
      oldY != undefined &&
      pos_x != null &&
      pos_x != undefined &&
      pos_y!= null &&
      pos_y != undefined) {
    return true;
  } else {
    return false;
  }
}
function performSetup () {
  connectSocket();
  setupPageUI();
  setupChat();

  setStatusUpdateCallbacks ();

  socket.emit('map-data-request');
}

$(document).ready(performSetup);
var socket = null;

function isSocketConnected () {
  return socket.connected;
}

function sendCharacterDetails() {
  var attrValuesJSON = getStats();
  var sessionJson = getSessionInfoJSON();
  if (attrValuesJSON != null && sessionJson != null){
    socket.emit('character-details', {'data': attrValuesJSON, 'sessionJson': sessionJson});
    console.log('Character details sent for saving..');
    updateMessageLog('Character details submitted (unsaved).', 'client');
  }
}

function sendNewChatMessage() {
  var userInput = $('#message-input').val();
	//console.log('message sent!: \''+userInput+'\'');
  sessionJson = getSessionInfoJSON();

  //console.log(sessionJson)

  if (userInput !== '') {
	   socket.emit('new-chat-message', {'data': userInput, 'sessionJson': sessionJson});
  }
}

//Tries to send movement input for the current user
function sendMovementCommand(x,y) {
  var sessionJson = getSessionInfoJSON();

  if (username != null && sessionId != null) {
  	socket.emit('movement-command', {'moveX': x, 'moveY': y, 'sessionJson': sessionJson});
  }
}

//Send the user's password to the sever
function sendAuthentication(username, passwordFieldVal){
  clientSession.username = username;
  socket.emit('client-auth', {'username': username, 'password': passwordFieldVal});
}

//Save our given session id for later, and display the welcome message
function linkConnection(data){
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

function setStatusUpdateCallbacks () {
    socket.on('movement-response', handleMovementResponse);
    socket.on('movement-update', handleMovementUpdate);
}

function saveMapUpdate (mapData) {
  overworldMap = JSON.parse(mapData['data']);
  overworldMapSizeX = mapData['map-size-x'];
  overworldMapSizeY = mapData['map-size-y'];
  console.log('MAP DATA RECEIVED');
}

function handleSessionError () {
  console.log('Session Error!');
}

function handleMessageData(data) {
  var messageData = data['data'];
  var username = data['sessionJson']['username'];
  console.log("Received: " + data);
  updateMessageLog(messageData, username);
}

function setupChat () {
	// Socket custom event trigger for message response, passing in our function for a callback
	socket.on('chat-message-response', handleMessageData);
  socket.on('connection-response', linkConnection);
  //socket.on('status-response', updateMessageLog);
  socket.on('map-data-response', saveMapUpdate);

  socket.on('character-details-update-status', handleCharacterUpdateResponse);

  socket.on('request-password', requestUserPassword); //  Request for existing password
  socket.on('request-new-password', userDoesNotExist); //  Request for new password

  //emit('login-success', userData['username'])
  socket.on('login-success', handlePlayerLogin);
  socket.on('login-failure', handlePlayerLoginError);
  socket.on('session-error', handleSessionError);
}
