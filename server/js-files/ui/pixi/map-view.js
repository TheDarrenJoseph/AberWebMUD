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
	if (startX >= halfViewMinus && startX < end_view_x && startY >= halfViewMinus && startY < end_view_y) {
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
