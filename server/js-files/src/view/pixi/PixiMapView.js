import * as PIXI from 'libs/pixi.min.js';

import SpriteHelper from 'src/helper/pixi/SpriteHelper.js';

import { MapPositionHelper } from 'src/helper/MapPositionHelper.js';
import { GridCharacter } from 'src/model/pixi/GridCharacter.js';

export var DEFAULT_TILE_SIZE = 40;

var DEFAULT_TILE_MAPPINGS = ['grass-plain', 'barn-front'];

export default class PixiMapView {
	constructor (mapModel, renderer, windowSize, assetPaths) {
		// For map model position validations
		this.mapModel = mapModel;

		//	Maps tile codes to resource keys
		this.tileMappings = DEFAULT_TILE_MAPPINGS;
		this.renderer = renderer;
		this.assetPaths = assetPaths;

		this.tileSize = DEFAULT_TILE_SIZE;

		// tileCount is the number of tiles we can fit into this square area
		this.tileCount = this.getFittableTiles(windowSize, this.tileSize);
		// This allows us to use tilecount as an offset / position later on
		this.zeroIndexedTileCount = this.tileCount - 1;

		//	These are the start/end integer co-ords of our map window (tile view)
		// These correspond to global map positions
		this.mapViewStartX = 0;
		this.mapViewStartY = 0;

		// Global ending position of the map view
		// Remove 1 from tileCount for zero indexing
		this.mapViewEndX = this.mapViewStartX + this.zeroIndexedTileCount;
		this.mapViewEndY = this.mapViewStartY + this.zeroIndexedTileCount;

		this.halfZeroIndexedTileCountFloored = Math.floor(this.zeroIndexedTileCount / 2);
		this.halfZeroIndexedTileCountCeiled = Math.ceil(this.zeroIndexedTileCount / 2);

		// Map Window Size based on fittable tiles
		this.mapWindowSize = (this.tileCount * this.tileSize);
		this.halfMapWindowSize = Math.floor(this.mapWindowSize / 2);

		// Lowest valid map start position is minus half of the map
		// This allows an edge of the map to be in the middle of the screen
		// The lower bound should always round down, and the upper round up
		this.lowestViewPosition = -this.halfZeroIndexedTileCountFloored;
		this.highestViewPosition = this.zeroIndexedTileCount - this.halfZeroIndexedTileCountCeiled;

		// Allow half under/overhang of the map viewing window
		this.mapViewMinPosition = [this.lowestViewPosition, this.lowestViewPosition];
		this.mapViewMaxPosition = [this.highestViewPosition, this.highestViewPosition];

		// Top level container for all children
		this.parentContainer = new PIXI.Container();

		// Using ParticleContainer for large amounts of sprites
		this.mapContainer = new PIXI.particles.ParticleContainer();
		this.mapContainer.name = 'mapContainer'
		this.characterContainer = new PIXI.particles.ParticleContainer();
		this.characterContainer.name = 'characterContainer';
		this.parentContainer.addChild(this.mapContainer, this.characterContainer);

		//	Sprites for the players in the current map view
		this.mapCharacterArray = this.createMapCharacterArray(this.tileCount);

		this.mapPositionHelper = new MapPositionHelper(this);

		// For quick debugging
		// console.log(this);
	}

	async initialise () {
		//	Sprites for the map viewPixiMapView
		var tsa = await this.buildTileSpriteArray();
		this.tileSpriteArray = tsa;
	}

	getParentContainer () {
		return this.parentContainer;
	}

	renderAll () {
		this.renderer.render(this.parentContainer);
	}

	renderMapContainer () {
		this.renderer.render(this.mapContainer);
	}

	renderCharacterContainer () {
		this.renderer.render(this.mapContainer);
	}

	getTileMappings () {
		return this.tileMappings;
	}

	// Slightly cleaner way to access the indexed tile keys
	getTileMapping (tileTypeIndex) {
		return this.tileMappings[tileTypeIndex];
	}

	//	Creates an empty 2D array to store players in our view
	createMapCharacterArray (tileCount) {
		// console.log('Tilecount: ' + tileCount);
		var mapCharacterArray = Array(tileCount);
		for (var x = 0; x < tileCount; x++) {
			mapCharacterArray[x] = Array(tileCount); // 2nd array dimension per row
		}

		return mapCharacterArray;
	}

	async buildTileSpriteArray () {
		// Create enough dummy tiles for the map model
		// Create a pretty crappy 2d array of tileCount size
		var tileSpriteArray = Array(this.tileCount);
		for (var x = 0; x < this.tileCount; x++) {
			tileSpriteArray[x] = Array(this.tileCount); // 2nd array dimension per row
			for (var y = 0; y < this.tileCount; y++) {
				let tileSprite = await SpriteHelper.makeSpriteFromAtlas(this.assetPaths.ASSET_PATH_OVERWORLD, 'grass-plain', DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
				let pixelX = x * this.tileSize;
				let pixelY = y * this.tileSize;
				let spritePos = new PIXI.Point(pixelX, pixelY);
				tileSprite.position = spritePos;
				tileSprite.interactive = true;
				tileSprite.name = '' + x + '' + y;

				//	allocate it to the tileSpriteArray
				tileSpriteArray[x][y] = tileSprite;

				// and to the Pixi Container
				this.mapContainer.addChild(tileSprite);
			}
		}

		return tileSpriteArray;
	}

	//	Creates a character sprite on-the-fly to represent another character
	//	gridX, gridY are character positions on the map
	async newCharacterOnMap (characterAtlasPath, charactername, gridX, gridY) {
		console.log('new char.. ' + charactername + gridX + gridY);

		if (!this.mapModel.isPositionInMap(gridX, gridY)) {
			throw new RangeError('Invalid position for GridCharacter! (must be valid overworld co-ord): ' + gridX + ',' + gridY);
		} else {
			//	Convert global co-ords to local view ones so we can modify the UI
			var localPos = this.mapPositionHelper.globalTilePosToLocal(gridX, gridY);
			var localX = localPos[0];
			var localY = localPos[1];
			if (this.isPositionRelativeToView(localX, localY)) {
				// We need to await so we can return this Sprite
				var characterSprite = await SpriteHelper.makeSpriteFromAtlas(this.assetPaths.ASSET_PATH_CHARACTERS, 'player', DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
				console.log('Async Awaited New sprite for mapview: ' + characterSprite);
				var pixiPos = this.mapPositionHelper.tileCoordToPixiPos(localX, localY);

				console.log('PIXI POS for new char: ' + pixiPos[0] + ' ' + pixiPos[1]);
				characterSprite.x = pixiPos[0];
				characterSprite.y = pixiPos[1];

				this.mapCharacterArray[localX][localY] = new GridCharacter(charactername, gridX, gridY, characterSprite);
				return characterSprite;
			} else {
				console.log('New player not in our view at this position: ' + gridX + ' ' + gridY);
			}

			return false;
		}
	}

	//	tileSpriteArray -- the grid array of sprites available to the UI
	//	mapData -- the JSON response from the server describing the area
	//	startX/Y - the start areas to draw from
	drawMapToGrid (startX, startY) {
		this.mapContainer.removeChildren(); //	Clear the map display container first

		//	Check there's at least enough tiles to fill our grid (square map)
		if (this.mapModel.mapTiles.length >= this.tileCount) {
			var endX = startX + this.tileCount;
			var endY = startY + this.tileCount;

			console.log('MAP DRAWING| to grid from: ' + startX + ' ' + startY + ' to ' + endX + ' ' + endY);

			//	Local looping to iterate over the view tiles
			//	Oh gosh condense this please!
			for (var x = 0; x < this.tileCount; x++) {
				for (var y = 0; y < this.tileCount; y++) {
					//	Accessing one of the window tiles
					let tileSprite = this.tileSpriteArray[x][y];

					var globalXY = this.mapPositionHelper.localTilePosToGlobal(x, y);
					var globalX = globalXY[0];
					var globalY = globalXY[1];

					if (this.this.mapModel.isPositionInMap(globalX, globalY)) {
						var tileFromServer = this.mapModel.mapTiles[globalX][globalY];

						if (tileSprite != null && tileFromServer != null) { //	Check the data for this tile exists
							//	var thisSprite = this.mapContainer.getChildAt(0); //	Our maptile sprite should be the base child of this tile
							var subTexturePromise = this.promiseAtlasSubtextureLoading(this.assetPaths.ASSET_PATH_OVERWORLD, this.tileMappings[tileFromServer.tileType]);

							subTexturePromise.then(subTexture => {
								//	If the texture exists, set this sprite's texture,
								// and add it back to the container
								if (subTexture != null) {
									tileSprite.texture = subTexture;
									this.mapContainer.addChild(tileSprite);
								}
							}).catch(err => {
								console.log('Subtexture promise failed when loading a texture to draw the map to view: ' + err);
							});
						} else {
							console.log('MAP DRAWING| overworld map data from remote is missing.');
						}
					}
				}
			}
		}
	}

	// Draws the map characters
	drawMapCharacterArray () {
		this.characterContainer.removeChildren();

		for (var x = 0; x < this.mapModel.tileCount; x++) {
			for (var y = 0; y < this.mapModel.tileCount; y++) {
				var thisCharacter = this.mapCharacterArray[x][y];

				if (thisCharacter != null && thisCharacter.sprite != null) {
					console.log('drawing tile..');
					this.characterContainer.addChild(thisCharacter.sprite);
				}
			}
		}
	}

	//	Check whether or not this position is a view-relative one using x/y from 0 - tileCount
	isPositionRelativeToView (x, y) {
		return (x < this.tileCount && x >= 0 && y < this.tileCount && y >= 0);
	}

	//	Checks that we have half the view out of the map maximum
	isValidMapViewPosition (startX, startY) {
		return (startX >= this.lowestViewPosition &&
						startX <= this.highestViewPosition &&
						startY >= this.lowestViewPosition &&
						startY <= this.highestViewPosition);
	}

	//	Checks to see if a local (view-based) tile pos is in the map
	isLocalPositionInMap (localX, localY) {
		let positionInStartingRange = localX >= this.mapViewStartX && localX >= this.mapViewStartY;

		// Calculate the end of the contained map
		let mapEndingX = this.mapViewStartX + this.mapModel.mapSizeX;
		let mapEndingY = this.mapViewStartY + this.mapModel.mapSizeY;
		let positionInEndingRange = localX <= mapEndingX && localX <= mapEndingY;

		return (positionInStartingRange && positionInEndingRange);
	}

	//	Check whether or not a GLOBAL POSITION is within our map view window
	isGlobalPositionInMapView (globalX, globalY) {
		if (globalX < (this.mapViewStartX + this.tileCount) &&
				globalX >= this.mapViewStartX &&
				globalY < (this.mapViewStartY + this.tileCount) &&
				globalY >= this.mapViewStartY) {
			return true;
		} else {
			return false;
		}
	}

	// Returns the smallest valid local view position that's on a map tile
	getLowestInMapPosition () {
		// We only need to adjust these values if the view is underhanging
		let lowestX = (this.mapViewStartX < 0) ? Math.abs(this.mapViewStartX) : 0;
		let lowestY = (this.mapViewStartY < 0) ? Math.abs(this.mapViewStartY) : 0;

		// Use abs to bump up any negatives to be the start of the map
		return [lowestX, lowestY];
	}

	// Returns the largest valid local view position (that's in the map model)
	getHighestInMapPosition () {
		let largestX = this.tileCount - 1;
		if (this.mapViewStartX > 0) {
			largestX = this.zeroIndexedTileCount - this.mapViewStartX;
		}

		let largestY = this.tileCount - 1;
		if (this.mapViewStartY > 0) {
			largestY = this.zeroIndexedTileCount - this.mapViewStartY;
		}

		return [largestX, largestY];
	}

	getFittableTiles (windowSize, tileSize) {
		// Rounding down (floor) to get a valid tile count on odd.
		let fittableTiles = Math.floor(windowSize / tileSize);
		// Ensure tileCount is even to allow nice halving.
		if (fittableTiles % 3 === 0) {
			fittableTiles--;
		}

		console.log('Chose mapview tile count of: ' + fittableTiles);
		return fittableTiles;
	}

	//	Adjusts the start values for drawing the map
	setMapViewPosition (startX, startY) {
		this.mapViewStartX = startX;
		this.mapViewStartY = startY;
	}

	// Get the number of tiles used squared for the view window
	getTilecount () {
		return this.tileCount;
	}

	// Starting co-ords of the map window
	getMapViewStartPosition () {
		return [this.mapViewStartX, this.mapViewStartY];
	}

	getMapViewMinPosition () {
		return this.mapViewMinPosition;
	}

	getMapViewMaxPosition () {
		return this.mapViewMaxPosition;
	}

	getViewPosition (gridX, gridY) {
		return [gridX - this.halfZeroIndexedTileCountFloored, gridY - this.halfZeroIndexedTileCountFloored];
	}
}

export { PixiMapView };
