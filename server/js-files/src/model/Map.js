// Raw data model for the current Map
// No errors thrown or validation here
// responsibility for data validation is on the calling controller
export var DEFAULT_MAP_SIZE_XY = 20;

export default class Map {
	constructor () {
		this.mapTiles = [];

		//	Sizes of the map
		this.mapSizeX = DEFAULT_MAP_SIZE_XY;
		this.mapSizeY = DEFAULT_MAP_SIZE_XY;

		console.log(this);
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

export { Map };
