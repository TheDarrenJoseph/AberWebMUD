//Check whether or not this position is a view-relative one using x/y from 0 - tileCount
function isPositionRelativeToView(x,y) {
	if (x < tileCount &&  x >= 0 &&  y < tileCount &&  y >= 0) return true;
	return false;
}

	//Check whether or not a GLOBAL POSITION is within our map view window
function isPositionInMapView(global_x, global_y) {
	if (global_x < (mapGridStartX+tileCount) &&  global_x >= mapGridStartX &&  global_y < (mapGridStartY + tileCount) &&  global_y >= mapGridStartY) {
		return true;
	} else {
		return false;
	}
}

// Checks whether the position is valid in the range of 0 - < mapSizeXorY
function isPositionInOverworld(global_x, global_y) {
	// < for max range as overworldMapSizes are 1 indexed
	if (global_x < overworldMapSizeX &&  global_x >= 0 &&  global_y < overworldMapSizeY &&  global_y >= 0) {
		return true;
	} else {
		return false;
	}
}

//	We only view the map through our view window,
//	This function adjusts a local position 0-tileCount (window co-ord), to a real position on the map
function localTilePosToGlobal (localX, localY) {

	//	Ensure these are view tile co-ordinates
	if (!isPositionRelativeToView(localX,localY)) {
		 throw new RangeError('Local tile pos for conversion not relative to the map view');
	} else {
		//Shift each of these positions by the starting position of our map view
		localX += mapGridStartX;
		localY += mapGridStartY;

		//Double check we're returning a sane overworld position
		if (!isPositionInOverworld(localX, localY)) {
			throw new RangeError ('Local tile pos for conversion plus offset, not in the overworld.');
		} else {
			return [localX, localY];
		}
	}

}


//	We only view the map through our view window,
//	This function adjusts the global position (with relative offset) to a value relative to the grid view
function globalTilePosToLocal(globalX, globalY) {
	if (!isPositionInOverworld(globalX, globalY)) {
		throw new RangeError('Global tile pos for conversion not in the overworld');
	} else {
		if (globalX < mapGridStartX || globalY < mapGridStartY || globalX > mapGridStartX+tileCount || globalY > mapGridStartY+tileCount) throw new RangeError('Global tile pos for conversion not in the local view');
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
function tileCoordToPixiPos (x_relative,y_relative) {
	if (!isPositionRelativeToView(x_relative,y_relative)) throw new RangeError('Tile-to-Pixi conversion, tile position invalid!'); //Sanity check

	var pos_x = (x_relative*tileSize);
	var pos_y = (y_relative*tileSize);

	console.log('Tilesize: '+tileSize+'Co-ord pos: '+x_relative+' '+y_relative+'\n'+'Pixi pos: '+pos_x+' '+pos_y);

	return [pos_x, pos_y];
}

function pixiPosToTileCoord (x,y) {
	//Sanity check for input co-ords
	var furthestPos = tileSize*tileCount;
	if (x < 0 || x > furthestPos || y < 0 || y > furthestPos) throw new RangeError('Pixi-to-Tile conversion, pixi position invalid!');

	//Round down so clicks on the upper-half of tiles still convert correctly
	var clientX = Math.floor(x / tileSize);
	var clientY = Math.floor(y / tileSize);

	// Sanity check to make sure we can't click over the boundary
	var zeroIndexedTileCount = tileCount - 1;
	if (clientX > zeroIndexedTileCount) clientX = zeroIndexedTileCount;
	if (clientY > zeroIndexedTileCount) clientY = zeroIndexedTileCount;

	console.log('PIXI pos: '+x+' '+y+'\n'+'Tile pos: '+clientX+' '+clientY);

	return[clientX,clientY]
}
