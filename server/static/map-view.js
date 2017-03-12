var stage = new PIXI.Container();

var dialogContainer = new PIXI.Container();
var controlsContainer = new PIXI.Container();

// Using ParticleContainer for large amounts of sprites
var mapContainer = new PIXI.ParticleContainer();
var characterContainer = new PIXI.ParticleContainer();

var tileSpriteArray; //	Sprites for the map view
var mapCharacterArray = [tileCount]; //	Sprites for the players in the current map view

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
