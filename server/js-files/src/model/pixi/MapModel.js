class MapClass {
	constructor () {
		this.mapTiles = [];
		this.mapSizeX = 0; //	Sizes of the map
		this.mapSizeY = 0;
		this.tileCount = null;
		//	Some arbitrary default
		this.tileSize = 40;

		this.dialogBackground = null;

		this.thisPlayer = null;

		//	These are the start co-ords of our map window (tile view) to allow map scrolling
		this.mapGridStartX = 0;
		this.mapGridStartY = 0;

		this.gridCharacter = {
			charactername: null,
			pos_x: null,
			pos_y: null,
			sprite: null
		};

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

		//	var halfTileCount = (tileCount/2); //	Always show a position in the middle of the view
		this.halfViewMinus = 0 - this.halfTileCountFloored;
		this.endViewX = this.mapSizeX - this.halfTileCountFloored;
		this.endViewY = this.mapSizeY - this.halfTileCountFloored;
	}

	getViewPosition (gridX, gridY) {
		return [gridX - this.halfTileCountFloored, gridY - this.halfTileCountFloored];
	}
}

var currentMap = new MapClass();
export { currentMap as Map };