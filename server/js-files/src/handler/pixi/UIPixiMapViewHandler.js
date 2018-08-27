import * as PIXI from 'libs/pixi.min-4-3-5.js';

//	Oh gosh it's messy
//	Needs to be cleaned up into a better pattern
//	possibly MVC like everything else
class UIPixiMapViewHandler {
	setupPixiContainers () {
		this.stage = new PIXI.Container();
		this.dialogContainer = new PIXI.Container();
		this.controlsContainer = new PIXI.Container();

		// Using ParticleContainer for large amounts of sprites
		this.mapContainer = new PIXI.ParticleContainer();
		this.characterContainer = new PIXI.ParticleContainer();

		//	Sprites for the map view
		this.tileSpriteArray = null;
		//	Sprites for the players in the current map view
		this.mapCharacterArray = this.createMapCharacterArray();

		//	Add everything to the stage
		this.stage.addChild(this.mapContainer);
		this.stage.addChild(this.dialogContainer);
		this.stage.addChild(this.controlsContainer);
		this.stage.addChild(this.characterContainer);
	}

	//	Calculate and assign pixel and tile sizes
	calculateMapWindowDimensions () {
		//	Some arbitrary default
		this.tileSize = 40;

		// Set our mapWindowSize to the smallest of our page dimensions
		// Using the smallest dimension to get a square
		// Then use 90% of this value to leave some space
		this.mapWindowSize = window.innerWidth;

		if (window.innerHeight < window.innerWidth) {
			this.mapWindowSize = window.innerHeight;
		}

		// tileCount is the number of tiles we can fit into this square area
		// Rounding down (floor) to get a good tile count
		this.tileCount = Math.floor(this.mapWindowSize / this.tileSize);
		this.halfTileCountFloored = Math.floor(this.tileCount / 2);
		this.halfTileCountCeiled = Math.ceil(this.tileCount / 2);

		//	Gee why is there a conditional statement here!?
		//	Ensure we have an even tileCount
		if (this.tileCount % 2 === 0) this.tileCount--;

		//	Update mapWindowSize to fit the tileCount snugly!
		this.mapWindowSize = (this.tileCount * this.tileSize);
		this.halfMapWindowSize = Math.floor(this.mapWindowSize / 2);
		this.thirdMapWindowSize = Math.floor(this.mapWindowSize / 3);
	}

	constructor () {
		this.setupPixiContainers();
		this.calculateMapWindowDimensions();

		this.dialogBackground = null;

		//	why is this here ??
		this.thisPlayer = null;

		//	These are the start co-ords of our map window (tile view) to allow map scrolling
		this.mapGridStartX = 0;
		this.mapGridStartY = 0;

		this.overworldMap = [];
		this.overworldMapSizeX = 0; //Sizes of the map
		this.overworldMapSizeY = 0;

		this.gridCharacter = {
			charactername: null,
			pos_x: null,
			pos_y: null,
			sprite: null
		};
	}

	static GridCharacter (charname, x, y, sprite) {
		if (!isPositionInOverworld(x, y)) throw new RangeError('Invalid position for GridCharacter! (must be valid overworld co-ord)');
		return {
			charname: charname,
			pos_x: x,
			pos_y: y,
			sprite: sprite
		}
	}

	static getAtlasSubtexture (tileAtlasPath, subtileName) {
		var atlasTexture = PIXI.loader.resources[tileAtlasPath];

		//	Check the texture
		if (atlasTexture != null) {
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

	static StatBar (name, posX, posY) {
		this.name = name;
		this.backgroundBar = new PIXI.Graphics();
		this.innerBar = new PIXI.Graphics();

		this.innerSizeX = this.thirdMapWindowSize - 9;
		this.innerSizeY = this.tileSize / 3 - 6;
		this.value = 100;

		StatBar.prototype.drawBackgroundBar = function () {
			this.backgroundBar.beginFill(0x000000);
			this.backgroundBar.lineStyle(2, 0xFFFFFF, 1);

			this.backgroundBar = this.backgroundBar.drawRoundedRect(posX, posY, thirdMapWindowSize, tileSize / 2, 4);
			this.backgroundBar.endFill();
		}

		StatBar.prototype.drawInnerBar = function () {
			this.innerBar.beginFill(0xFF0000);
			this.innerBar = this.innerBar.drawRoundedRect(posX + 6, posY + 6, this.innerSizeX, this.innerSizeY, 4);
			this.innerBar.endFill();
		}

		//	Sets a statbar's indicated value using a 1-100 value
		//	Returns true if changes made, false otherwise
		StatBar.prototype.setValue = function (value) {
			if (this.value === value) return false;

			if (value <= 100 && value >= 0) {
				this.value = value;
				this.innerSizeX = ((this.innerSizeX / 100) * value); //	Simple percentage adjustment for Y size
			} else return false;
		}
	}

	static setMapViewPosition (startX, startY) {
		//	var halfTileCount = (tileCount/2); //	Always show a position in the middle of the view
		var halfViewMinus = 0 - halfTileCountFloored;
		var endViewX = overworldMapSizeX - halfTileCountFloored;
		var endViewY = overworldMapSizeY - halfTileCountFloored;

		// if (isPositionInOverworld(startX, startY)) {
		//	Checks that we have half the view out of the map maximum
		if (startX >= halfViewMinus && startX < endViewX && startY >= halfViewMinus && startY < endViewY) {
			//	Adjusting the start values for drawing the map
			this.mapGridStartX = startX;
			this.mapGridStartY = startY;
		} else {
			throw new RangeError('Position not in overworld: ' + startX + ' ' + startY);
		}
	}

	//	Moves the UI to a new position and draws the map there
	static showMapPosition(gridX, gridY){
		//	This will throw a RangeError if our position is invalid (doubles as a sanity-check)
		this.setMapViewPosition(gridX - halfTileCountFloored, gridY - halfTileCountFloored);
		console.log('Drawing map from this position: ' + gridX + ' ' + gridY);
		//	Draw the view at this position
		drawMapToGrid(gridX, gridY);
	}
}

export { UIPixiMapViewHandler };
