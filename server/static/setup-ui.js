var titleText = 'AberWebMUD';
var zeldaAssetPath = 'static/assets/gfx/';
var overworldAtlasPath = zeldaAssetPath + 'overworld-texture-atlas.json';
var zeldaObjectsAtlasPath = zeldaAssetPath + 'zelda-objects-texture-atlas.json';
var characterAtlasPath = zeldaAssetPath + 'character-texture-atlas.json';

var messageWindowId = '#message-window';

var tileMappings = ['grass-plain','barn-front'];

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

//Creates an empty 2D array to store players in our view
function createMapCharacterArray () {
	var mapCharacterArray = Array(tileCount);
	for (var x = 0; x < tileCount; x++) {
		mapCharacterArray[x] = Array(tileCount); // 2nd array dimension per row
	}

	return mapCharacterArray;
}

function setupConsoleButton () {
	//var consoleButtonSprite = makeSpriteFromTileset(zeldaObjectsTilesetPath, 0, 16, 16, 16);
	//var consoleButtonSprite = PIXI.Sprite.fromImage(zeldaAssetPath+'chat-bubble-blank.png');
	var consoleButtonSprite = makeSpriteFromAtlas (zeldaObjectsAtlasPath, 'chat-bubble-blank');

	consoleButtonSprite.height = tileSize;
	consoleButtonSprite.width = tileSize;

	consoleButtonSprite.x = 0;
	consoleButtonSprite.y = mapWindowSize - tileSize;

	consoleButtonSprite.interactive = true;

	controlsContainer.addChild(consoleButtonSprite);
	consoleButtonSprite.on ('click', toggleConsoleVisibility);
}

function setupContextButtons () {
	//var inventoryButtonSprite = makeSpriteFromTileset(zeldaObjectsTilesetPath, 0, 0, 16, 16);
	var inventoryButtonSprite = makeSpriteFromAtlas (zeldaObjectsAtlasPath, 'chest-single');

	//inventoryButtonSprite.height = tileSize;
	//inventoryButtonSprite.width = tileSize * 2;
	//inventoryButtonSprite.position.x = mapWindowSize - (tileSize * 2);
	//inventoryButtonSprite.position.y = mapWindowSize - tileSize;

	inventoryButtonSprite.x = 10;
	inventoryButtonSprite.y = 10;
	inventoryButtonSprite.height = tileSize;
	inventoryButtonSprite.width = tileSize * 2;
	inventoryButtonSprite.position.x = mapWindowSize - (tileSize * 2);
	inventoryButtonSprite.position.y = mapWindowSize - tileSize;
	inventoryButtonSprite.interactive = true;

	controlsContainer.addChild(inventoryButtonSprite);
	inventoryButtonSprite.on ('click', showDialog);

	var statsButtonSprite = makeSpriteFromAtlas (characterAtlasPath, 'player');

	statsButtonSprite.height = tileSize;
	statsButtonSprite.width = tileSize;
	statsButtonSprite.position.x = mapWindowSize - (tileSize * 3);
	statsButtonSprite.position.y = mapWindowSize - tileSize;
	statsButtonSprite.interactive = true;

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
	//	dialogBackground.visible = false; //Hidden until we need it

	return [healthBar];
}

function characterSpriteExists(charactername, x,y) {
	var character = mapCharacterArray[x][y];
	//if ()
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
function globalTilePosToLocal(globalX,globalY) {

}

function showMapPosition(gridX,gridY){
	if (isPositionInOverworld(gridX, gridY)) {
		mapGridStartX = gridX;
		mapGridStartY = gridY;

		drawMapToGrid (gridX, gridY); //Draw the view at this position
	}
}

//Creates a character sprite on-the-fly to represent another character
//gridX, gridY are UI co-ords from 0-tileCount
function newCharacterOnMap (charactername, gridX, gridY) {
	console.log('new char.. ' + charactername + gridX + gridY);

	if (isPositionInMapView(gridX, gridY)) {
			var characterSprite = makeSpriteFromAtlas(characterAtlasPath, 'player');
			var pixiPos = coordToPixiPosition(gridX, gridY);
			characterSprite.x = pixiPos[0];
			characterSprite.y = pixiPos[1];
			characterContainer.addChild(characterSprite);

			console.log(mapCharacterArray);

			console.log(mapCharacterArray[gridX][gridY] );
			mapCharacterArray[gridX][gridY] = GridCharacter(charactername, gridX, gridY, characterSprite);

			return characterSprite;
	} else {
		console.log('New player not in view '+gridX+' '+gridY);
	}

	return false;
}

function updateCharacterSpritePos(oldX, oldY, x, y) {
	var sprite = mapCharacterArray[oldX][oldY];

	var characterPos = coordToPixiPosition(x, y);
	sprite.x = characterPos[0];
	sprite.y = characterPos[1];
	characterContainer.addChild(sprite);
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
