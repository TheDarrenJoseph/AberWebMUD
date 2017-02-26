var titleText = 'AberWebMUD';
var zeldaAssetPath = 'static/assets/gfx/';
var overworldAtlasPath = zeldaAssetPath + 'overworld-texture-atlas.json';
var zeldaObjectsAtlasPath = zeldaAssetPath + 'zelda-objects-texture-atlas.json';
var characterAtlasPath = zeldaAssetPath + 'character-texture-atlas.json';

var messageWindowId = '#message-window';

var tileSize = 40;

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

// resolution 1 for now as default (handles element scaling)
var renderingOptions = {
	resolution: 1
};

// Create our PixiJS renderer space
// var renderer = PIXI.autoDetectRenderer(500, 500, renderingOptions);
var renderer = PIXI.autoDetectRenderer(mapWindowSize, mapWindowSize);
renderer.autoresize = true;

var stage = new PIXI.Container();
var mapContainer = new PIXI.ParticleContainer(); // Using spritebatch for large amounts of sprites
var dialogContainer = new PIXI.Container();
stage.addChild(mapContainer);
stage.addChild(dialogContainer);

var dialogBackground;
var healthBar;
var healthBarInner;

// Creates a new PIXI.Sprite from a tileset  loaded in by Pixi's resource loader
//function makeSpriteFromTileset (tilesetPath, offsetX, offsetY, tileSizeX, tileSizeY) {
	//var tileTexture = new PIXI.Texture(PIXI.loader.resources[tilesetPath].texture);

	//console.log(tileTexture);

	//tileTexture.frame = new PIXI.Rectangle(offsetX, offsetY, tileSizeX, tileSizeY); //	Using a rectangle to frame our texture area
	//return new PIXI.Sprite(tileTexture);
//}

// Creates a new PIXI.Sprite from a tileset atlas loaded in by Pixi's resource loader
function makeSpriteFromAtlas (tileAtlasPath, subtileName) {
	var atlasTexture = PIXI.loader.resources[tileAtlasPath];

	//Check the texture
	if (atlasTexture  != null) {
		var subTexture = atlasTexture.textures[subtileName];

		if (subTexture != null) {
			return new PIXI.Sprite(subTexture);

		} else {
			console.log('No tile atlas subtile (not in tile atlas JSON?): ' + subtileName);
		}

	} else {
		console.log('Error loading tile atlas (not known to loader?): ' + tileAtlasPath);
	}

	return null;
}

function MapTileSprite () {
	// var MapTileSprite = new PIXI.Sprite(PIXI.loader.resources[chestPath].texture);
	//var MapTileSprite = makeSpriteFromAtlas(overworldTilesetPath, 0, 0, 16, 16);
	//var MapTileSprite = makeSpriteFromAtlas(overworldAtlasPath, 'grass-plain');
	var MapTileSprite = PIXI.Sprite.fromFrame('grass-plain');

	MapTileSprite.height = tileSize;
	MapTileSprite.width = tileSize;

	return MapTileSprite;
}

// Allocates a tile array for the map view
function MapArray (tileCount) {
	var tileArray = Array(tileCount);

	for (var x = 0; x < tileCount; x++) {
		tileArray[x] = Array(tileCount); // 2nd array dimension per row
		for (var y = 0; y < tileCount; y++) {
			tileArray[x][y] = MapTileSprite(); // Allocate a new tile
		}
	}

	return tileArray;
}

// Write our MapArray to the PixiJS stage
function setupMapUI (tileSpriteArray, tileCount) {
	for (var x = 0; x < tileCount; x++) {
		for (var y = 0; y < tileCount; y++) {
			var tileSprite = tileSpriteArray[x][y]; // Reference to new tile in the array

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
}

function stageClicked () {
	var mouseEvent = renderer.plugins.interaction.pointer.originalEvent;

	var clientX = Math.floor(mouseEvent.clientX / tileSize);
	var clientY = Math.floor(mouseEvent.clientY / tileSize);

	var zeroIndexedTileCount = tileCount - 1;

	// Sanity check to make sure we can't click over the boundary
	if (clientX > zeroIndexedTileCount) clientX = zeroIndexedTileCount;
	if (clientY > zeroIndexedTileCount) clientY = zeroIndexedTileCount;

	console.log(clientX + ' ' + clientY);
}

function objectClicked (object) {
	// console.log(object.name+" clicked");
	// object.x += 50;

	// renderer.render(stage);
}

function toggleConsoleVisibility() {
	$(messageWindowId).toggle();
}

function setupConsoleButton () {
	//var consoleButtonSprite = makeSpriteFromTileset(zeldaObjectsTilesetPath, 0, 16, 16, 16);
	//var consoleButtonSprite = PIXI.Sprite.fromImage(zeldaAssetPath+'chat-bubble-blank.png');
	var consoleButtonSprite = PIXI.Sprite.fromFrame('player-attacking');

	consoleButtonSprite.height = tileSize;
	consoleButtonSprite.width = tileSize;

	consoleButtonSprite.x = 0;
	consoleButtonSprite.y = mapWindowSize - tileSize;

	consoleButtonSprite.interactive = true;

	stage.addChild(consoleButtonSprite);
	consoleButtonSprite.on ('click', toggleConsoleVisibility);
}

function setupContextButtons () {
	//var inventoryButtonSprite = makeSpriteFromTileset(zeldaObjectsTilesetPath, 0, 0, 16, 16);
	var inventoryButtonSprite = PIXI.Sprite.fromFrame('player');

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

	stage.addChild(inventoryButtonSprite);
	inventoryButtonSprite.on ('click', showDialog);

	var statsButtonSprite = PIXI.Sprite.fromFrame('player');

	statsButtonSprite.height = tileSize;
	statsButtonSprite.width = tileSize;
	statsButtonSprite.position.x = mapWindowSize - (tileSize * 3);
	statsButtonSprite.position.y = mapWindowSize - tileSize;
	statsButtonSprite.interactive = true;

	stage.addChild(statsButtonSprite);

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

function updateStatBar(statbar) {
 //	var valueBar = statbar.innerBar;

	//valueBar.beginFill(0x000000);
	//valueBar.drawRect(statbar.x, statbar.y, statbar.innerSizeX, statbar.innerSizeY);
	//valueBar.endFill();
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

//	Creates the needed stat bars
//	Returns an array of these statbars for later adjustment
function setupStatBars () {
	var healthBar = new StatBar('health-bar', mapWindowSize - thirdMapWindowSize - 2, 0);

	stage.addChild(healthBar.backgroundBar);
	stage.addChild(healthBar.innerBar);
	//	dialogBackground.visible = false; //Hidden until we need it

	return [healthBar];
}

function showDialog () {
	dialogBackground.visible = !dialogBackground.visible;
	renderer.render(stage); //	update the view to show this
}

function makeTestSquare () {
	var testSquare = new PIXI.Graphics();

	testSquare.beginFill(0xFFFFFF);
	testSquare.lineStyle(2, 0xFFFFFF, 1);
	testSquare.drawRect(20, 20, 200, 200);
	testSquare.endFill();
	stage.addChild(testSquare);

	testSquare.interactive = true;

	// Assigning a click event using a callback function to pass the object as params
	testSquare.on('click', function callbackWithTheObject () { return objectClicked(testSquare); });
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
	setupConsoleButton();
	var contextButtons = setupContextButtons();

	setupDialogWindow();

	var statBars = setupStatBars();
	console.log(statBars);
	statBars[0].setValue(20);
	statBars[0].drawBackgroundBar();
	statBars[0].drawInnerBar();

	var tileSpriteArray = MapArray(tileCount);
	setupMapUI(tileSpriteArray, tileCount);

	$('console-button').append(contextButtons);

	renderer.render(stage);
}

function bindEvents(){
	$('#send-message-button').click(sendMessage);
	$('#main-window').on('click', function () { return stageClicked(renderer); });
}



function setupPage () {
	//$('#message-window').hide();

	// Arbitrary assignment of message log window size for now
	//$('#message-log').rows = 5;
	//$('#message-log').cols = 100;
	$('#message-log').val('');

	// Callback for after assets have loaded (for drawing)
	PIXI.loader.add([overworldAtlasPath,
									zeldaObjectsAtlasPath,
									characterAtlasPath]).load(assetsLoaded);

	bindEvents();
}

// wait until our document is ready
$(document).ready(setupPage);
