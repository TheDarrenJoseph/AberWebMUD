import * as PIXI from 'libs/pixi.min.js';

import { PixiController } from 'src/controller/pixi/PixiController.js';
import { PixiMapView } from 'src/view/pixi/PixiMapView.js';
import { PositionHelper } from 'src/helper/PositionHelper.js';
// import { SpriteHelper } from 'src/helper/pixi/SpriteHelper.js';
import { Map } from 'src/model/pixi/Map.js';

// Kind of a singleton class for now
class MapController {
	constructor () {
		// Setup the pixi map view so we have our window dimensions
		PixiMapView.setupCalculateMapWindowDimensions();

		// Instanciate a map model
		this.mapModel = new Map(PixiMapView.mapWindowSize);
		console.log(this.mapModel.tileCount);
		PixiMapView.setupPixiContainers(this.mapModel.tileCount);
	}

	//	tileSpriteArray -- the grid array of sprites available to the UI
	//	mapData -- the JSON response from the server describing the area
	//	startX/Y - the start areas to draw from
	drawMapToGrid (startX, startY) {
		PixiMapView.mapContainer.removeChildren(); //	Clear the map display container first

		//	Check there's at least enough tiles to fill our grid (square map)
		if (this.mapModel.mapTiles.length >= this.mapModel.tileCount) {
			var endX = startX + this.mapModel.tileCount;
			var endY = startY + this.mapModel.tileCount;

			console.log('MAP DRAWING| to grid from: ' + startX + ' ' + startY + ' to ' + endX + ' ' + endY);

			//	Local looping to iterate over the view tiles
			//	Oh gosh condense this please!
			for (var x = 0; x < this.mapModel.tileCount; x++) {
				for (var y = 0; y < this.mapModel.tileCount; y++) {
					//	Accessing one of the window tiles
					var tileSprite = PixiMapView.tileSpriteArray[x][y];

					try {
						var globalXY = PositionHelper.localTilePosToGlobal(x, y);
						var globalX = globalXY[0];
						var globalY = globalXY[1];

						if (PositionHelper.isPositionInOverworld(globalX, globalY)) {
							var tileFromServer = this.mapModel.mapTiles[globalX][globalY];

							if (tileSprite != null && tileFromServer != null) { //	Check the data for this tile exists
								//	var thisSprite = PixiMapView.mapContainer.getChildAt(0); //	Our maptile sprite should be the base child of this tile
								var subTexture = this.getAtlasSubtexture(PixiController.overworldAtlasPath, PixiController.tileMappings[tileFromServer.tileType]);

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

		PixiController.renderStage();
	}

	getAtlasSubtexture (tileAtlasPath, subtileName) {
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

	setMapViewPosition (startX, startY) {
		//	Checks that we have half the view out of the map maximum
		if (startX >= this.mapModel.halfViewMinus && startX < this.mapModel.endViewX && startY >= this.mapModel.halfViewMinus && startY < this.mapModel.endViewY) {
			//	Adjusting the start values for drawing the map
			this.mapModel.mapViewStartX = startX;
			this.mapModel.mapViewStartY = startY;
		} else {
			throw new RangeError('Position not in overworld: ' + startX + ' ' + startY);
		}
	}

	//	Moves the UI to a new position and draws the map there
	showMapPosition (gridX, gridY) {
		this.mapModel.getViewPosition(gridX, gridY);

		//	This will throw a RangeError if our position is invalid (doubles as a sanity-check)
		this.setMapViewPosition(gridX - this.mapModel.halfTileCountFloored, gridY - this.mapModel.halfTileCountFloored);
		console.log('Drawing map from this position: ' + gridX + ' ' + gridY);
		//	Draw the view at this position
		this.drawMapToGrid(gridX, gridY);
	}
}

// Create an instance we can refer to nicely (hide instanciation)
let mapController = new MapController();
export default mapController;
export { mapController as MapController };
