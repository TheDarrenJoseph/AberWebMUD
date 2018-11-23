// Helper class for Map position calculation and verification

export var POS_TILE_TO_PIXI_INVALID_TILE_ERROR = 'Tile-to-Pixi conversion, tile position invalid!';
export var POS_TILE_TO_PIXI_INVALID_PIXI_ERROR = 'Tile-to-Pixi conversion, pixi position invalid!';

// A slightly crappy way of building checkable exception messages for now
export var POS_LOCAL_TO_GLOBAL_LOCAL_INVALID_START = 'Local tile pos not in the local map view. local: ';
export function POS_LOCAL_TO_GLOBAL_LOCAL_INVALID (localX, localY) {
	return new RangeError(POS_LOCAL_TO_GLOBAL_LOCAL_INVALID_START + 'local: ' + ': ' + localX + ',' + localY);
}
export var POS_LOCAL_TO_GLOBAL_CONVERTED_INVALID_START = 'Local tile pos converted not in the global map. converted: ';
export function POS_LOCAL_TO_GLOBAL_CONVERTED_INVALID (shiftedLocalX, shiftedLocalY, localX, localY) {
	return new RangeError(POS_LOCAL_TO_GLOBAL_CONVERTED_INVALID_START + shiftedLocalX + ',' + shiftedLocalY + ' local: ' + ': ' + localX + ',' + localY);
}
export var POS_GLOBAL_TO_LOCAL_NOT_IN_MAP_START = 'Global tile pos for conversion not in the global map:';
export function POS_GLOBAL_TO_LOCAL_NOT_IN_MAP (globalX, globalY) {
	throw new RangeError(POS_GLOBAL_TO_LOCAL_NOT_IN_MAP_START + ': ' + globalX + ',' + globalY);
}
export var POS_GLOBAL_TO_LOCAL_NOT_IN_VIEW_START = 'Global tile pos for conversion not in the map view:';
export function POS_GLOBAL_TO_LOCAL_NOT_IN_VIEW (globalX, globalY) {
	throw new RangeError(POS_GLOBAL_TO_LOCAL_NOT_IN_VIEW_START + ': ' + globalX + ',' + globalY);
}

export class MapPositionHelper {
	constructor (pixiMapView) {
		this.pixiMapView = pixiMapView;
	}

	//	We only view the map through our view window,
	//	This static adjusts a local position 0-tileCount (window co-ord), to a real position on the map
	localTilePosToGlobal (localX, localY) {
		//	Ensure these are view tile co-ordinates
		if (this.pixiMapView.isPositionRelativeToView(localX, localY)) {
			//	Shift each of these positions by the starting position of our map view
			let shiftedLocalX = localX + this.pixiMapView.mapViewStartX;
			let shiftedLocalY = localY + this.pixiMapView.mapViewStartY;

			//	Double check we're returning a sane global map position
			if (this.pixiMapView.mapModel.isPositionInMap(localX, localY)) {
				return [shiftedLocalX, shiftedLocalY];
			} else {
				throw POS_LOCAL_TO_GLOBAL_CONVERTED_INVALID(shiftedLocalX, shiftedLocalY, localX, localY);
			}
		} else {
			throw POS_LOCAL_TO_GLOBAL_LOCAL_INVALID(localX, localY);
		}
	}

	//	We only view the map through our view window,
	//	This static adjusts the global position (with relative offset) to a value relative to the grid view
	globalTilePosToLocal (globalX, globalY) {
		var mapViewStartX = this.pixiMapView.mapViewStartX;
		var mapViewStartY = this.pixiMapView.mapViewStartY;

		if (!this.pixiMapView.mapModel.isPositionInMap(globalX, globalY)) {
			throw POS_GLOBAL_TO_LOCAL_NOT_IN_MAP(globalX, globalY);
		} else {
			if (!this.pixiMapView.isGlobalPositionInMapView(globalX, globalY)) {
				throw POS_GLOBAL_TO_LOCAL_NOT_IN_VIEW(globalX, globalY);
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
