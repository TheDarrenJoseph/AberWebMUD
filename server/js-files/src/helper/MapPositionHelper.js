// Helper class for Map position calculation and verification

export var POS_TILE_TO_PIXI_INVALID_TILE_ERROR = 'Tile-to-Pixi conversion, tile position invalid!';
export var POS_TILE_TO_PIXI_INVALID_PIXI_ERROR = 'Tile-to-Pixi conversion, pixi position invalid!';

export class MapPositionHelper {
	constructor (pixiMapView) {
		this.pixiMapView = pixiMapView;
	}

	//	We only view the map through our view window,
	//	This static adjusts a local position 0-tileCount (window co-ord), to a real position on the map
	localTilePosToGlobal (localX, localY) {
		//	Ensure these are view tile co-ordinates
		if (this.pixiMapView.isPositionRelativeToView(localX, localY)) {
			console.log('MapViewStartX: '+this.pixiMapView.mapViewStartX);
			console.log('MapViewStartY: '+this.pixiMapView.mapViewStartY);

			//	Shift each of these positions by the starting position of our map view
			let shiftedLocalX = localX + this.pixiMapView.mapViewStartX;
			let shiftedLocalY = localY + this.pixiMapView.MapViewStartY;

			//	Double check we're returning a sane global map position
			if (this.pixiMapView.mapModel.isPositionInMap(localX, localY)) {
				return [shiftedLocalX, shiftedLocalY];
			} else {
				console.log(localX + ' ' + localY + ' to global conversion failed against: ' + this.pixiMapView.mapSizes);
				throw new RangeError('Local tile pos for conversion plus offset, not in the global map: ' + ': ' + localX + ',' + localY);
			}
		} else {
			throw new RangeError('Local tile pos for conversion not relative to the map view' + ': ' + localX + ',' + localY);
		}
	}

	//	We only view the map through our view window,
	//	This static adjusts the global position (with relative offset) to a value relative to the grid view
	globalTilePosToLocal (globalX, globalY) {
		var mapViewStartX = this.pixiMapView.mapViewStartX;
		var mapViewStartY = this.pixiMapView.mapViewStartY;

		if (!this.pixiMapView.mapModel.isPositionInMap(globalX, globalY)) {
			throw new RangeError('Global tile pos for conversion not in the global map: ' + ': ' + globalX + ',' + globalY);
		} else {
			if (globalX < mapViewStartX ||
					globalY < mapViewStartY ||
					globalX > mapViewStartX + this.pixiMapView.tileCount ||
					globalY > mapViewStartY + this.pixiMapView.tileCount) {
				throw new RangeError('Global tile pos for conversion not in the local view: ' + ': ' + globalX + ',' + globalY);
			}
			return [globalX - mapViewStartX, globalY - mapViewStartY];
		}
	}

	//	Converts tile coords from 0,0 - X,X based on tilecount to a Pixi stage pixel position
	//		-This takes a global position (say the map is 20 tiles, so from 0-19)
	//		-that position is then converted to a pixel amount based:
	//				--tile size
	//				--how many tiles are in the UI
	//				--where the view window is
	//		-Returns an array of len 2 [x,y]m there
	tileCoordToPixiPos (xRelative, yRelative) {
		//	Sanity check
		if (!this.pixiMapView.isPositionRelativeToView(xRelative, yRelative)) throw new RangeError(POS_TILE_TO_PIXI_INVALID_TILE_ERROR);

		var posX = (xRelative * this.pixiMapView.tileSize);
		var posY = (yRelative * this.pixiMapView.tileSize);

		// console.log('Tilesize: '+tileSize+'Co-ord pos: '+x_relative+' '+y_relative+'\n'+'Pixi pos: '+pos_x+' '+pos_y);

		return [posX, posY];
	}

	pixiPosToTileCoord (x, y) {
		//	Sanity check for input co-ords
		var furthestPos = this.pixiMapView.tileSize * this.pixiMapView.tileCount;
		if (x < 0 || x > furthestPos || y < 0 || y > furthestPos) throw new RangeError(POS_TILE_TO_PIXI_INVALID_PIXI_ERROR);

		//	Round down so clicks on the upper-half of tiles still convert correctly
		var clientX = Math.floor(x / this.pixiMapView.tileSize);
		var clientY = Math.floor(y / this.pixiMapView.tileSize);

		// Sanity check to make sure we can't click over the boundary
		var zeroIndexedTileCount = this.pixiMapView.tileCount - 1;
		if (clientX > zeroIndexedTileCount) clientX = zeroIndexedTileCount;
		if (clientY > zeroIndexedTileCount) clientY = zeroIndexedTileCount;

		// console.log('PIXI pos: '+x+' '+y+'\n'+'Tile pos: '+clientX+' '+clientY);
		return [clientX, clientY];
	}
}

export default MapPositionHelper;
