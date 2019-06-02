import PIXI from 'libs/pixi.min.js';

import SpriteHelper from 'src/helper/pixi/SpriteHelper.js';
import ArrayHelper from 'src/helper/ArrayHelper.js';
import Player from 'src/model/Player.js';

import { MapPositionHelper } from 'src/helper/MapPositionHelper.js';
import { MapCharacter } from 'src/model/pixi/map/MapCharacter.js';
import { DEFAULT_TILE_SIZE } from 'src/model/pixi/map/MapModel.js';

export var DEFAULT_TILE_MAPPINGS = ['grass-plain', 'barn-front'];

var DEFAULT_WINDOW_SIZE_PIXELS = 500;
var DEFAULT_WINDOW_SIZE = DEFAULT_WINDOW_SIZE_PIXELS / DEFAULT_TILE_SIZE;

export default class PixiMapView {

	/**
	 *
	 * @param mapModel a MapModel
	 * @param renderer PIXI.WebGLRenderer or PIXI.CanvasRenderer
	 * @param windowSize square window size Number (pixels)
	 * @param assetPaths
	 */
	constructor (mapModel, renderer, windowSize, tileSize, assetPaths) {

		if (mapModel !== undefined) {
			// For map model position validations
			this.mapModel = mapModel;
		} else {
			throw new RangeError("MapModel undefined.");
		}

		//	Maps tile codes to resource keys
		this.tileMappings = DEFAULT_TILE_MAPPINGS;

		if (renderer instanceof PIXI.WebGLRenderer || renderer instanceof PIXI.CanvasRenderer) {
			this.renderer = renderer;
		} else {
			throw new RangeError("renderer is not a supported Pixi Renderer type (WebGLRenderer, CanvasRenderer): " + renderer);
		}

		this.assetPaths = assetPaths;

		if (tileSize == undefined) {
			this.tileSize = DEFAULT_TILE_SIZE;
		} else {
			this.tileSize = tileSize;
		}

		if (windowSize !== undefined) {
			this.windowSize = windowSize;
		} else {
			this.windowSize = DEFAULT_WINDOW_SIZE;
		}

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
		this.highestViewPosition = ((this.mapModel.mapSizeX) - this.halfZeroIndexedTileCountFloored);

		// Allow half under/overhang of the map viewing window
		this.mapViewMinPosition = [this.lowestViewPosition, this.lowestViewPosition];
		this.mapViewMaxPosition = [this.highestViewPosition, this.highestViewPosition];

		// Top level container for all children
		this.parentContainer = new PIXI.Container();
		this.parentContainer.width = this.windowSize;
		this.parentContainer.height = this.windowSize;

		// Using ParticleContainer for large amounts of sprites
		this.mapContainer = new PIXI.particles.ParticleContainer();
		this.mapContainer.name = 'mapContainer';
		this.mapContainer.width = this.windowSize;
		this.mapContainer.height = this.windowSize;

		this.characterContainer = new PIXI.particles.ParticleContainer();
		this.characterContainer.name = 'characterContainer';
		this.characterContainer.width = this.windowSize;
		this.characterContainer.height = this.windowSize;

		// Add everything to the parent
		this.parentContainer.addChild(this.mapContainer, this.characterContainer);

		this.mapPositionHelper = new MapPositionHelper(this);

		//console.log('New Map View. Sizes: tiles:' + this.tileCount + ' size (px) : ' + this.mapWindowSize, ' tile size: ' + this.tileSize)
		// For quick debugging
		// console.log(this);
	}


	getParentContainer () {
		return this.parentContainer;
	}

	renderAll () {
		console.log('PixiMapView - Rendering all containers.');
		this.renderer.render(this.parentContainer);
	}

	renderMapContainer () {
		console.log('PixiMapView - Rendering map container.');
		this.renderer.render(this.mapContainer);
	}

	renderCharacterContainer () {
		console.log('PixiMapView - Rendering character container.');
		this.renderer.render(this.characterContainer);
	}

	getTileSize () {
		return this.tileSize;
	}

	getTileMappings () {
		return this.tileMappings;
	}

	// Slightly cleaner way to access the indexed tile keys
	getTileMapping (tileTypeIndex) {
		return this.tileMappings[tileTypeIndex];
	}

	/**
	 * Removes the matching sprite for the given x,y, and username from the Pixi container.
	 * @param x local view X pos
	 * @param y local view Y pos
	 * @param username player username to find
	 */
	removePlayerFromView(x, y, username) {
		let playerCharacterSprite = this.mapModel.getPlayer(x,y, username).getCharacter().getSprite();
		if (playerCharacterSprite !== null) {
			characterContainer.removeChild(playerCharacterSprite);
		} else {
			throw new RangeError("Player Character Sprite not found to remove it from the map view.");
		}
	}

	/**
	 * Needed?
	 * Adds all map tile sprites to the respective Pixi Container for rendering
	 */
	addMapTilesToView () {
		// Create enough dummy tiles for the map model
		// Create a pretty crappy 2d array of tileCount size
		for (var x = 0; x < this.mapSizeX; x++) {
			for (var y = 0; y < this.mapSizeY; y++) {
				// Add the map tile sprites to the mapContainer
				let mapTileSprite = this.mapModel.getTile(x, y).getSprite();
				if (mapTileSprite !== undefined && mapTileSprite !== null) {
					this.mapContainer.addChild(mapTileSprite);
				}
			}
		}
	}

	/**
	 * Needed?
	 * Adds all character sprites to the respective Pixi Container for rendering
	 */
	addPlayersToView () {
		// Create enough dummy tiles for the map model
		// Create a pretty crappy 2d array of tileCount size
		for (var x = 0; x < this.mapSizeX; x++) {
			for (var y = 0; y < this.mapSizeY; y++) {
				// Extract the sprites for every player on the tile
				// And add those to the container too
				let mapCharacterSprites = this.mapModel.getPlayers(x,y).map(player => player.getCharacter().getSprite());
				mapCharacterSprites.forEach(sprite => {
					let charSprite  = mapCharacterSprites[i];
					if (charSprite !== undefined && charSprite !== null) {
						this.characterContainer.addChild(charSprite);
					}
				});

			}
		}
	}

	promiseSpriteForTile (tileType, localX, localY) {
		var pixiPos = this.mapPositionHelper.tileCoordToPixiPos(localX, localY);
		// Promise the loading of the subtexture
		var spritePromise = SpriteHelper.makeSpriteFromAtlas(this.assetPaths.ASSET_PATH_OVERWORLD, this.tileMappings[tileType], DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE, pixiPos, false);
		return spritePromise;
	}

	promiseSpriteForPlayer (localX, localY) {
		var pixiPos = this.mapPositionHelper.tileCoordToPixiPos(localX, localY);
		// Promise the loading of the subtexture
  	var spritePromise = SpriteHelper.makeSpriteFromAtlas(this.assetPaths.ASSET_PATH_CHARACTERS, 'player', DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE, pixiPos, false);
		return spritePromise;
	}

	// Creates a character sprite on-the-fly to represent another character
	//	gridX, gridY are character positions on the map
	// TODO subscribe to new Players added  / Adjustments to the MapModel instead
	/**
	 *
	 * @param username
	 * @param charactername
	 * @param gridX
	 * @param gridY
	 * @returns {Promise<*>}
	 */
	async newPlayerOnMap (username, charactername, gridX, gridY) {
		if (!this.mapModel.isPositionInMap(gridX, gridY)) {
			throw new RangeError('Invalid position for MapCharacter! (must be a valid global map co-ord): ' + gridX + ',' + gridY);
		} else {
			//	Convert global co-ords to local view ones so we can modify the UI
			var localPos = this.mapPositionHelper.globalTilePosToLocal(gridX, gridY);
			var localX = localPos[0];
			var localY = localPos[1];
			if (this.isPositionRelativeToView(localX, localY)) {
				// We need to await so we can return this Sprite
				var characterSprite = await this.promiseSpriteForPlayer(localX, localY);
				let mapCharacter = new MapCharacter(charactername, gridX, gridY, characterSprite);
				let newPlayer = new Player('Person', mapCharacter);
				this.mapModel.addPlayer(localX, localY, newPlayer);
				return newPlayer;
			} else {
				let error = 'New player not in our view at this position: ' + gridX + ' ' + gridY;
				throw new RangeError(error);
			}
		}
	}

	/**
	 *
	 * @returns a Promise for as many Sprites as we've needed to create
	 */
	drawPlayers() {
		// Clear the map display container first
		this.mapContainer.removeChildren();

		//	Local looping to iterate over the view tiles
		//	Oh gosh condense this please!
		for (var x = 0; x < this.tileCount; x++) {
			for (var y = 0; y < this.tileCount; y++) {
				var globalXY = this.mapPositionHelper.localTilePosToGlobal(x, y);
				var globalX = globalXY[0];
				var globalY = globalXY[1];

				let players = this.mapModel.getPlayers(x,y);

				// If there are players, get the top one, create a Sprite for them and draw them to the map
				if (players != undefined && players != null && players.length >= 1) {

					let playerSprite = players.get(0).getCharacter().getSprite();

					// Try simply adding the sprite if it's set
					if (playerSprite != undefined && playerSprite != null) {
						this.mapContainer.addChild(playerSprite);
					}
				}
			}
		}
	}

	/**
	 * Draws the Map Tiles to the map view
	 * @returns a Promise for as many Sprites as we've needed to create
	 */
	async drawMapTiles() {
		let spritePromises = new Array();

		// Clear the map display container first
		this.mapContainer.removeChildren();

		//	Local looping to iterate over the view tiles
		//	Oh gosh condense this please!
		for (var x = 0; x < this.tileCount; x++) {
			for (var y = 0; y < this.tileCount; y++) {
				var globalXY = this.mapPositionHelper.localTilePosToGlobal(x, y);
				var globalX = globalXY[0];
				var globalY = globalXY[1];
				let mapTile = this.mapModel.getTile(globalX, globalY);
				let validPos = this.mapModel.isPositionInMap(globalX, globalY);

				if (mapTile !== undefined && mapTile !== null && validPos) {
						let tileType = mapTile.getTileType();
						let tileSprite = mapTile.getSprite();

						// Get a Sprite if needed and update what's set
						if (tileSprite == undefined || tileSprite == null) {
								tileSprite = await this.promiseSpriteForTile(tileType, x, y);
								mapTile.setSprite(tileSprite)
						}

						this.mapContainer.addChild(tileSprite);
				}
			}
		}

		return Promise.all(spritePromises).then(() => { this.renderMapContainer });
	}

	/**
	 * Draws the map characters,
	 * making assumptions that character sprites are already set (I hate making these)
	 */
	drawMapPlayerArray () {
		this.characterContainer.removeChildren();

		for (var x = 0; x < this.mapModel.tileCount; x++) {
			for (var y = 0; y < this.mapModel.tileCount; y++) {
				// Draw whatever's at the top of the array
				//var thisCharacter = this.mapPlayerArray[x][y][0];
				var thisCharacter = this.mapModel.getPlayers(x,y).get(0).getCharacter();

				if (thisCharacter != null && thisCharacter.sprite != null) {
					this.characterContainer.addChild(thisCharacter.sprite);
				}
			}
		}

		renderCharacterContainer;
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

	/**
	 *
	 * @returns {number|*} the lowest possible tile-index position for this view
	 */
	getLowestViewPosition() {
		return this.lowestViewPosition;
	}

	/**
	 *
	 * @returns {number|*} the lowest possible tile-index position for this view
	 */
	getHighestViewPosition() {
		return this.highestViewPosition;
	}


	//	Checks to see if a local (view-based) tile pos 
	//	Is actually on a map tile
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
		return (globalX < (this.mapViewStartX + this.tileCount) &&
				globalX >= this.mapViewStartX &&
				globalY < (this.mapViewStartY + this.tileCount) &&
				globalY >= this.mapViewStartY);
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
		// I guess we'll check types ffs
		if (Number.isInteger(windowSize) && Number.isInteger(tileSize)) {
			// Rounding down (floor) to get a valid tile count on odd.
			let fittableTiles = Math.floor(windowSize / tileSize);
			// Ensure tileCount is even to allow nice halving.
			if (fittableTiles % 3 === 0) {
				fittableTiles--;
			}

			// DEBUG
			//console.log(windowSize + ',' + tileSize + ' Fittable: ' + fittableTiles)
			return fittableTiles;
		} else {
			throw new RangeError("Cannot get fittable tiles, input(s) non-Number : " + windowSize + ", " + tileSize);
		}
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
