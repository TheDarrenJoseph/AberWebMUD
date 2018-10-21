import { MapModel } from 'src/model/pixi/MapModel.js';
import { MapController } from 'src/controller/pixi/MapController.js';

class PositionHelper {
	//	Check whether or not this position is a view-relative one using x/y from 0 - tileCount
	static isPositionRelativeToView (x, y) {
		if (x < MapModel.tileCount && x >= 0 && y < MapModel.tileCount && y >= 0) return true;
		return false;
	}

	//	Check whether or not a GLOBAL POSITION is within our map view window
	static isPositionInMapView (globalX, globalY) {
		if (globalX < (MapController.mapGridStartX + MapModel.tileCount) &&
				globalX >= MapController.mapGridStartX &&
				globalY < (MapController.mapGridStartY + MapModel.tileCount) &&
				globalY >= MapController.mapGridStartY) {
			return true;
		} else {
			return false;
		}
	}

	// Checks whether the position is valid in the range of 0 - < mapSizeXorY
	static isPositionInOverworld (globalX, globalY) {
		// < for max range as mapTilesSizes are 1 indexed
		if (globalX < MapController.mapSizeX &&
				globalX >= 0 &&
				globalY < MapController.mapSizeY &&
			globalY >= 0) {
			return true;
		} else {
			return false;
		}
	}

	//	We only view the map through our view window,
	//	This static adjusts a local position 0-tileCount (window co-ord), to a real position on the map
	static localTilePosToGlobal (localX, localY) {
		//	Ensure these are view tile co-ordinates
		if (!PositionHelper.isPositionRelativeToView(localX, localY)) {
			throw new RangeError('Local tile pos for conversion not relative to the map view');
		} else {
			//	Shift each of these positions by the starting position of our map view
			localX += MapController.mapGridStartX;
			localY += MapController.mapGridStartY;

			//	Double check we're returning a sane overworld position
			if (!PositionHelper.isPositionInOverworld(localX, localY)) {
				throw new RangeError('Local tile pos for conversion plus offset, not in the overworld.');
			} else {
				return [localX, localY];
			}
		}
	}

	//	We only view the map through our view window,
	//	This static adjusts the global position (with relative offset) to a value relative to the grid view
	static globalTilePosToLocal (globalX, globalY) {
		var mapGridStartX = MapController.mapGridStartX;
		var mapGridStartY = MapController.mapGridStartY;

		if (!PositionHelper.isPositionInOverworld(globalX, globalY)) {
			throw new RangeError('Global tile pos for conversion not in the overworld');
		} else {
			if (globalX < mapGridStartX ||
					globalY < mapGridStartY ||
					globalX > mapGridStartX + MapModel.tileCount ||
					globalY > mapGridStartY + MapModel.tileCount) {
				throw new RangeError('Global tile pos for conversion not in the local view');
			}
			return [globalX - mapGridStartX, globalY - mapGridStartY];
		}
	}

	//	Converts tile coords from 0,0 - X,X based on tilecount to a Pixi stage pixel position
	//		-This takes a global position (say the map is 20 tiles, so from 0-19)
	//		-that position is then converted to a pixel amount based:
	//				--tile size
	//				--how many tiles are in the UI
	//				--where the view window is
	//		-Returns an array of len 2 [x,y]m there
	static tileCoordToPixiPos (xRelative, yRelative) {
		//	Sanity check
		if (!PositionHelper.isPositionRelativeToView(xRelative, yRelative)) throw new RangeError('Tile-to-Pixi conversion, tile position invalid!');

		var posX = (xRelative * MapController.tileSize);
		var posY = (yRelative * MapController.tileSize);

		// console.log('Tilesize: '+tileSize+'Co-ord pos: '+x_relative+' '+y_relative+'\n'+'Pixi pos: '+pos_x+' '+pos_y);

		return [posX, posY];
	}

	static pixiPosToTileCoord (x, y) {
		//	Sanity check for input co-ords
		var furthestPos = MapController.tileSize * MapController.tileCount;
		if (x < 0 || x > furthestPos || y < 0 || y > furthestPos) throw new RangeError('Pixi-to-Tile conversion, pixi position invalid!');

		//	Round down so clicks on the upper-half of tiles still convert correctly
		var clientX = Math.floor(x / MapController.tileSize);
		var clientY = Math.floor(y / MapController.tileSize);

		// Sanity check to make sure we can't click over the boundary
		var zeroIndexedTileCount = MapController.tileCount - 1;
		if (clientX > zeroIndexedTileCount) clientX = zeroIndexedTileCount;
		if (clientY > zeroIndexedTileCount) clientY = zeroIndexedTileCount;

		// console.log('PIXI pos: '+x+' '+y+'\n'+'Tile pos: '+clientX+' '+clientY);
		return [clientX, clientY];
	}
}

export { PositionHelper };
