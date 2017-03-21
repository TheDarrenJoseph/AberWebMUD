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

	if (!isPositionInOverworld(gridX, gridY)) {
		console.log('bad pos: '+gridX+' '+gridY);
		return false; //	Do nothing if the coordinates don't exist on the map
	} else {
		//Convert global co-ords to local view ones so we can modify the UI
		var localPos = globalTilePosToLocal(gridX, gridY);
		var localX = localPos[0];
		var localY = localPos[1];

		console.log('new char at:'+localX+' '+localY);

		if (isPositionRelativeToView(localX, localY)) {
				var characterSprite = makeSpriteFromAtlas(characterAtlasPath, 'player');

				var pixiPos = tileCoordToPixiPos(localX, localX);
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

}

function updateCharacterSpritePos(charname, oldX, oldY, x, y) {
	//Have they only moved within the screen?
	if (isPositionInMapView(oldX, oldY)) {
		//Moves the sprite to the new position
		if (isPositionInMapView(x, y)) {
			console.log('Moving '+charname+'!');
			var sprite = mapCharacterArray[oldX][oldY];

			if (sprite != null){
				var characterPos = tileCoordToPixiPos(x, y);
				
				sprite.x = characterPos[0];
				sprite.y = characterPos[1];
				characterContainer.addChild(sprite);
				renderer.render(stage);
			}
		} else {
			//Moved out of screen
			//Remove the sprite at oldX, oldY
			console.log(charname+' walked out of view!');
		}

	} else if (isPositionInMapView(x, y)) { //Moved into screen from
		newCharacterOnMap (charactername, x, y); //Create a sprite to show them!
		console.log(charname+' has walked into view!');
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
