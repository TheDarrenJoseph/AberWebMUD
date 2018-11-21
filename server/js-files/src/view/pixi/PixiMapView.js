import * as PIXI from 'libs/pixi.min.js';

import SpriteHelper from 'src/helper/pixi/SpriteHelper.js';

import { MapPositionHelper } from 'src/helper/MapPositionHelper.js';
import { GridCharacter } from 'src/model/pixi/GridCharacter.js';

export var DEFAULT_TILE_SIZE = 40;

export default class PixiMapView {
	constructor (mapModel, tileMappings, renderer, overworldAtlasPath, windowSize) {

		// For map model position validations
		this.mapModel = mapModel;

		this.tileMappings = tileMappings;
		this.renderer = renderer;
		this.overworldAtlasPath = overworldAtlasPath;

		this.tileSize = DEFAULT_TILE_SIZE;

		// tileCount is the number of tiles we can fit into this square area
		this.tileCount = this.getFittableTiles(windowSize, this.tileSize);

		//	These are the start/end integer co-ords of our map window (tile view)
		this.mapViewStartX = 0;
		this.mapViewStartY = 0;
		// Remove 1 from tileCount for zero indexing
		this.mapViewEndX = this.mapViewStartX + (this.tileCount - 1);
		this.mapViewEndY = this.mapViewStartY + (this.tileCount - 1);

		this.halfTileCountFloored = Math.floor(this.tileCount / 2);
		this.halfTileCountCeiled = Math.ceil(this.tileCount / 2);

		// Map Window Size based on fittable tiles
		this.mapWindowSize = (this.tileCount * this.tileSize);
		this.halfMapWindowSize = Math.floor(this.mapWindowSize / 2);

		// Lowest valid map start position is minus half of the map
		// This allows an edge of the map to be in the middle of the screen
		// The lower bound should always round down, and the upper round up
		this.lowestViewPosition = -this.halfTileCountFloored;
		this.highestViewPosition = this.tileCount - this.halfTileCountCeiled;

		// Allow half under/overhang of the map viewing window
		this.mapViewMinPosition = [this.lowestViewPosition, this.lowestViewPosition];
		this.mapViewMaxPosition = [this.highestViewPosition, this.highestViewPosition];

		// For quick debugging
		console.log(this);
	}

	setupPixiContainers (tileCount) {
		// Top level container for all children
		this.parentContainer = new PIXI.Container();

		// Using ParticleContainer for large amounts of sprites
		this.mapContainer = new PIXI.particles.ParticleContainer();
		this.characterContainer = new PIXI.particles.ParticleContainer();
		this.parentContainer.addChild(this.mapContainer, this.characterContainer);

		//	Sprites for the map viewPixiMapView
		this.tileSpriteArray = null;
		//	Sprites for the players in the current map view
		this.mapCharacterArray = this.createMapCharacterArray(tileCount);
	}

	getParentContainer () {
		return this.parentContainer;
	}

	renderAll () {
		this.renderer.render(this.parentContainer);
	}

	renderMapContainer () {
		this.renderer.render(this.this.mapContainer);
	}

	renderCharacterContainer () {
		this.renderer.render(this.this.mapContainer);
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

	setupMapUI (overworldAtlasPath, tileCount, tileSize) {
		// Create a pretty crappy 2d array of tileCount size
		var tileSpriteArray = Array(tileCount);
		for (var x = 0; x < tileCount; x++) {
			tileSpriteArray[x] = Array(tileCount); // 2nd array dimension per row
			for (var y = 0; y < tileCount; y++) {
				// Create a new Pixi Sprite
				var tileSprite = SpriteHelper.makeSpriteFromAtlas(this.overworldAtlasPath, 'grass-plain');
				tileSprite.position.x = x * tileSize;
				tileSprite.position.y = y * tileSize;
				tileSprite.interactive = true;
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
	newCharacterOnMap (characterAtlasPath, charactername, gridX, gridY) {
		console.log('new char.. ' + charactername + gridX + gridY);

		if (!this.mapModel.isPositionInMap(gridX, gridY)) {
			console.log('bad pos: ' + gridX + ' ' + gridY);
			return false; //	Do nothing ican't access lexical declarationf the coordinates don't exist on the map
		} else {
			//	Convert global co-ords to local view ones so we can modify the UI
			var localPos = MapPositionHelper.globalTilePosToLocal(gridX, gridY);
			var localX = localPos[0];
			var localY = localPos[1];

			if (this.isPositionRelativeToView(localX, localY)) {
				var characterSprite = SpriteHelper.makeSpriteFromAtlas(characterAtlasPath, 'player');
				var pixiPos = MapPositionHelper.tileCoordToPixiPos(localX, localY);

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
		PixiMapView.mapContainer.removeChildren(); //	Clear the map display container first

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
					let tileSprite = PixiMapView.tileSpriteArray[x][y];

					try {
						var globalXY = this.mapPositionHelper.localTilePosToGlobal(x, y);
						var globalX = globalXY[0];
						var globalY = globalXY[1];

						if (this.this.mapModel.isPositionInMap(globalX, globalY)) {
							var tileFromServer = this.mapModel.mapTiles[globalX][globalY];

							if (tileSprite != null && tileFromServer != null) { //	Check the data for this tile exists
								//	var thisSprite = PixiMapView.mapContainer.getChildAt(0); //	Our maptile sprite should be the base child of this tile
								var subTexture = this.getAtlasSubtexture(this.overworldAtlasPath, this.tileMappings[tileFromServer.tileType]);

								//	If the texture exists, set this sprite's texture,
								// and add it back to the container
								if (subTexture != null) {
									tileSprite.texture = subTexture;
									PixiMapView.mapContainer.addChild(tileSprite);
								}
							}
						}
					} catch (err) {
						continue;
					}
				}
			}
		} else {
			console.log('MAP DRAWING| overworld map data from remote is missing.');
		}
	}

	// Draws the map characters
	drawMapCharacterArray () {
		PixiMapView.characterContainer.removeChildren();

		for (var x = 0; x < this.mapModel.tileCount; x++) {
			for (var y = 0; y < this.mapModel.tileCount; y++) {
				var thisCharacter = PixiMapView.mapCharacterArray[x][y];

				if (thisCharacter != null && thisCharacter.sprite != null) {
					console.log('drawing tile..');
					PixiMapView.characterContainer.addChild(thisCharacter.sprite);
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

	//	Check whether or not a GLOBAL POSITION is within our map view window
	isPositionInMapView (globalX, globalY) {
		if (globalX < (this.mapViewStartX + this.tileCount) &&
				globalX >= this.mapViewStartX &&
				globalY < (this.mapViewStartY + this.tileCount) &&
				globalY >= this.mapViewStartY) {
			return true;
		} else {
			return false;
		}
	}

	getFittableTiles (windowSize, tileSize) {
		// Rounding down (floor) to get a valid tile count on odd.
		let fittableTiles = Math.floor(windowSize / tileSize);
		// Ensure tileCount is even
		if (fittableTiles % 2 === 0) {
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
		return [gridX - this.halfTileCountFloored, gridY - this.halfTileCountFloored];
	}
}
