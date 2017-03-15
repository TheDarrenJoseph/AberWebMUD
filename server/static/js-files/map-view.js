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
