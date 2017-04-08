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
