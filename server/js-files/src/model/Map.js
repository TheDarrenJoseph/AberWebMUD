import MapTile from 'src/model/MapTile.js';

// Raw data model for the current Map
// No errors thrown or validation here
// responsibility for data validation is on the calling controller
export var DEFAULT_MAP_SIZE_XY = 20;

export default class Map {
	constructor (tileCount = DEFAULT_MAP_SIZE_XY) {
		this.mapTiles = this.setupTiles();

		//	Sizes of the map
		this.mapSizeX = tileCount;
		this.mapSizeY = tileCount;

		console.log(this);
	}

	// Initialise the map tile array
	setupTiles () {
		// Create enough dummy tiles for the map model
		// Create a pretty crappy 2d array of tileCount size
		this.mapTiles = Array(this.mapSizeX);
		for (var x = 0; x < this.mapSizeX; x++) {
			this.mapTiles[x] = Array(this.mapSizeY); // 2nd array dimension per row

			for (var y = 0; y < this.mapSizeY; y++) {
				this.mapTiles[x][y] = new MapTile();
			}
		}
	}

	// Checks whether the position is valid in the range of 0 - < mapSizeXorY
	isPositionInMap (globalX, globalY) {
		// < for max range as map tiles are 0-indexed
		if (globalX < this.mapSizeX &&
				globalX >= 0 &&
				globalY < this.mapSizeY &&
				globalY >= 0) {
			return true;
		} else {
			return false;
		}
	}

	getMapSizes () {
		return [this.mapSizeX, this.mapSizeY];
	}
}

// Allow named import also
export { Map };
