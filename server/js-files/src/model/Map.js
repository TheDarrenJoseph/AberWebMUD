import MapTile from 'src/model/MapTile.js';
import ArrayHelper from 'src/helper/ArrayHelper.js'

// Raw data model for the current Map
// No errors thrown or validation here
// responsibility for data validation is on the calling controller
export var DEFAULT_MAP_SIZE_XY = 20;

export default class Map {
	constructor (tileCount = DEFAULT_MAP_SIZE_XY) {
		this.mapSizeX = tileCount;
		this.mapSizeY = tileCount;
		this.mapTiles = ArrayHelper.create2dArray(this.mapSizeX, this.mapSizeY, MapTile);
	}

	// Checks if a global pos is in the local map pos range
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
