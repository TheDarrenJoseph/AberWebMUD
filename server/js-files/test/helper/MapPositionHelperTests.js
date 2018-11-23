import DEFAULT_MAP_SIZE_XY from 'src/model/Map.js';

import { MapController } from 'src/controller/MapController.js';
import { testPositionRangeError } from 'test/utils/PositionTestHelper.js';
import { PixiView } from 'src/view/pixi/PixiView.js';

var POSITION_TEST_TAG = '|MAP-POSITION-HELPER|';

let pixiView = new PixiView();
let mapController = new MapController(pixiView);
let mapModel = mapController.getMap();
let pixiMapView = mapController.getPixiMapView();
let mapPositionHelper = mapController.getPositionHelper();

const tileCount = mapController.getPixiMapView().tileCount;
const tileSize = mapController.getPixiMapView().tileSize;

// Setup / assertions before any test runs
function beforeAll () {
	assert.ok(typeof mapPositionHelper !== 'undefined');

	// Must have a decent value for the map window size
	assert.ok(mapController.getMap().mapWindowSize > 500);

	// Ensure the lower bound is set as expected
	let mapViewStartPos = pixiMapView.getMapViewStartPosition();
	assert.equal(mapViewStartPos[0], 0);
	assert.equal(mapViewStartPos[1], 0);

	let mapSizes = mapController.getMap().getMapSizes();
	assert.equal(mapSizes[0], DEFAULT_MAP_SIZE_XY);
	assert.equal(mapSizes[1], DEFAULT_MAP_SIZE_XY);

	assert.equal(tileCount, DEFAULT_MAP_SIZE_XY);
}

// Setup / assertions before each test
function beforeEachTest () {
	// DO SOME STUFF
}

// Hookup before each test setup / assertion
QUnit.module('viewPositionTests', { before: beforeAll });
QUnit.module('viewPositionTests', { beforeEach: beforeEachTest });

//	Testing relative co-ords (tile view co-ords) that are 0 indexed
QUnit.test(POSITION_TEST_TAG + 'relative-to-view-valid', function (assert) {
	//	Lowest possible
	assert.ok(pixiMapView.isPositionRelativeToView(0, 0), 'Checking validity of map view position 0,0');
	//	Highest possible (-1 for 0 indexing)
	let largestPos = tileCount - 1;
	assert.ok(pixiMapView.isPositionRelativeToView(largestPos, largestPos), 'Checking validity of largest map view pos ' + largestPos + ',' + largestPos);
}
);

QUnit.test(POSITION_TEST_TAG + 'relative-to-view-invalid', function (assert) {
	let justOverTileCount = tileCount + 1;

	//  Lower x bound out of range
	assert.notOk(
		pixiMapView.isPositionRelativeToView(-1, 0), 'Check X bound under-range (-1)');
	//  Lower y bound out of range
	assert.notOk(pixiMapView.isPositionRelativeToView(0, -1), 'Check Y bound under-range (-1)');
	//  Higher x bound out of range
	assert.notOk(pixiMapView.isPositionRelativeToView(
		justOverTileCount, 0), 'Check X bound over-range (' + justOverTileCount + ')');
	//  Higher y bound out of range
	assert.notOk(pixiMapView.isPositionRelativeToView(
		0, justOverTileCount), 'Check Y bound over-range (' + justOverTileCount + ')');
	//  Lower x and y bound out of range
	assert.notOk(pixiMapView.isPositionRelativeToView(-1, -1), 'Check X and Y (-1, -1) bound under-range.');

	//  Upper x and y bound out of range
	assert.notOk(pixiMapView.isPositionRelativeToView(
		justOverTileCount, justOverTileCount), 'Check X and Y (' + justOverTileCount + ',' + justOverTileCount + ') bound over-range.');
}
);

QUnit.test(POSITION_TEST_TAG + 'in-mapview-valid', function (assert) {

	// Wherever our map view is starting (top-left corner)
	let mapViewStartPos = mapController.getPixiMapView().getMapViewStartPosition();
	let mapStartX = mapViewStartPos[0];
	let mapStartY = mapViewStartPos[1];

	//  Lowest range posible
	assert.ok(pixiMapView.isPositionInMapView(mapStartX, mapStartY), 'Check lowest valid map view range: ' + mapStartX + ',' + mapStartY);

	// Calculate the end of our map-view (bottom-right)
	let tileCountIncrement = tileCount - 1;
	let topRangeX = mapStartX + tileCountIncrement;
	let topRangeY = mapStartX + tileCountIncrement;

	// Highest range possible
	assert.ok(
		pixiMapView.isPositionInMapView(topRangeX,
			topRangeY), 'Check highest valid range in-map-view: ' + topRangeX + ',' + topRangeY);
}
);

// The map view can move around a larger map, check invalid global positions
QUnit.test(POSITION_TEST_TAG + 'in-mapview-invalid', function (assert) {
	let mapViewStartPos = mapController.getPixiMapView().getMapViewStartPosition();
	let mapViewStartX = mapViewStartPos[0];
	let mapViewStartY = mapViewStartPos[1];

	// Correct starting positions - 1
	let xBoundUnder = mapViewStartX - 1;
	let yBoundUnder = mapViewStartY - 1;

	// Correct ending positions + 1
	let xBoundOver = mapViewStartX + tileCount + 1;
	let yBoundOver = mapViewStartY + tileCount + 1;

	assert.notOk(pixiMapView.isPositionInMapView(xBoundUnder, mapViewStartY), 'Check mapview x bound under range: ' + xBoundUnder + ',' + mapViewStartY);
	assert.notOk(pixiMapView.isPositionInMapView(mapViewStartX, yBoundUnder), 'Check mapview y bound under range: ' + mapViewStartX + ',' + yBoundUnder);
	assert.notOk(pixiMapView.isPositionInMapView(-1, -1), 'Check mapview x and y bound under range: ' + xBoundUnder + ',' + mapViewStartY);

	assert.notOk(pixiMapView.isPositionInMapView(-1, mapViewStartY), 'Check mapview negative x is invalid: ' + -1 + ',' + 0);
	assert.notOk(pixiMapView.isPositionInMapView(mapViewStartX, -1), 'Check mapview negative y is invalid:  ' + 0 + ',' + -1);
	assert.notOk(pixiMapView.isPositionInMapView(-1, -1), 'Check mapview negative x and y is invalid ' + xBoundUnder + ',' + mapViewStartY);

	assert.notOk(pixiMapView.isPositionInMapView(xBoundOver, mapViewStartY), 'Check mapview x bound over range: ' + xBoundOver + ',' + mapViewStartY);
	assert.notOk(pixiMapView.isPositionInMapView(mapViewStartX, yBoundOver), 'Check mapview y bound over range: ' + mapViewStartX + ',' + yBoundOver);
	assert.notOk(pixiMapView.isPositionInMapView(xBoundOver, yBoundOver), 'Check mapview x and y bound over range: ' + xBoundOver + ',' + yBoundOver);
}
);

//	Check that a position is valid for the global map
QUnit.test(POSITION_TEST_TAG + 'in-map-valid', function (assert) {
	//	Lowest possible co-ords
	assert.ok(mapModel.isPositionInMap(0, 0), 'Check global map position 0, 0 is valid.');
	//	Highest possible co-ords
	let mapSizes = mapController.getMap().getMapSizes();
	// -1 for zero indexing
	let maxMapX = mapSizes[0] - 1;
	let maxMapY = mapSizes[1] - 1;

	assert.ok(mapModel.isPositionInMap(maxMapX, 0), 'Check global map x maximum position ' + maxMapX + ',' + 0);
	assert.ok(mapModel.isPositionInMap(0, maxMapY), 'Check global map y maximum position ' + 0 + ',' + maxMapY);

	assert.ok(mapModel.isPositionInMap(maxMapX, maxMapY), 'Check global map maximum position (' + maxMapX + ',' + maxMapY + ')');
}
);

QUnit.test(POSITION_TEST_TAG + 'in-map-invalid', function (assert) {
	// Under lowest possible co-ords (x)
	assert.notOk(mapModel.isPositionInMap(-1, 0), 'Check invalid global x position -1, 0');
	// Under lowest possible co-ords (y)
	assert.notOk(mapModel.isPositionInMap(0, -1), 'Check invalid global y position  0, -1 ');

	// Max valid positions
	let mapSizes = mapController.getMap().getMapSizes();
	let mapXOneIndexed = mapSizes[0];
	let mapYOneIndexed = mapSizes[1];

	assert.notOk(mapModel.isPositionInMap(mapXOneIndexed, 0), 'Check maximum global map x pos +1 : ' + mapXOneIndexed); //  Over highest possible co-ords (x)
	//  Over highest possible co-ords (y)
	assert.notOk(mapModel.isPositionInMap(0, mapYOneIndexed), 'Check maximum global map y pos  +1 : ' + mapYOneIndexed);
}
);

//	Test conversion of a window-local co-ordinate to a map global position
//  e.g the top-left corner 0, 0 could be on tile 20 of the map
QUnit.test(POSITION_TEST_TAG + 'local-to-global-valid', function (assert) {
	let mapViewStartPos = mapController.getPixiMapView().getMapViewStartPosition();
	let mapViewStartX = mapViewStartPos[0];
	let mapViewStartY = mapViewStartPos[1];
	assert.deepEqual(mapViewStartPos, [0, 0], 'Check map view starting positions are zero.');

  //	Local position (relative to view) is 0-tilecount-1, global = X or Y+XYoffset
  //	1. Lowest possible local position
	let result = mapPositionHelper.localTilePosToGlobal(0, 0);
	assert.equal(result[0], mapViewStartX, 'Check local mapview position 0, 0 resolves to mapview start x');
	assert.equal(result[1], mapViewStartY, 'Check local mapview position 0, 0 resolves to mapview start y');

	//	2. Highest possible local position with an offset (-1 for zero indexing)
	let zeroIndexedTileCount = tileCount - 1;
	// Check conversion to global position of the end of the map view
	// -1 for zero indexing
	let mapSizes = mapController.getMap().getMapSizes();
	let globalMapEndX = mapSizes[0] - 1;
	let globalMapEndY = mapSizes[1] - 1;
	console.log('mapSizes: ' + mapSizes);

	let highestLocalXPos = null;
	let highestLocalYPos = null;
	// Check to see if the view has more tiles than the map contains
	if (zeroIndexedTileCount >= globalMapEndX || zeroIndexedTileCount >= globalMapEndY) {
		console.log('More tiles in map view than on the map.');
		highestLocalXPos = zeroIndexedTileCount - (zeroIndexedTileCount - globalMapEndX);
		highestLocalYPos = zeroIndexedTileCount - (zeroIndexedTileCount - globalMapEndY);
	} else {
		console.log('Fewer tiles in map view than on the map.');
		highestLocalXPos = zeroIndexedTileCount;
		highestLocalYPos = zeroIndexedTileCount;
	}
	result = mapPositionHelper.localTilePosToGlobal(highestLocalXPos, highestLocalYPos);
	assert.equal(result[0], highestLocalXPos, 'Check highest mapview x pos ' + highestLocalXPos + ' resolves to the correct global postion: ' + highestLocalXPos);
	assert.equal(result[1], highestLocalYPos, 'Check highest mapview y pos ' + highestLocalXPos + ' resolves to the correct global postion: ' + highestLocalYPos);

	// Try moving the map view back as far as possible
	let furthestBackwardViewPos = -Math.floor(zeroIndexedTileCount / 2);
	console.log(' Checking furthest back map view position: ' + furthestBackwardViewPos + ', ' + furthestBackwardViewPos);
	mapController.setMapViewPosition(furthestBackwardViewPos, furthestBackwardViewPos);
	let expectedX = highestLocalXPos + furthestBackwardViewPos;
	let expectedY = highestLocalYPos + furthestBackwardViewPos;

	result = mapPositionHelper.localTilePosToGlobal(zeroIndexedTileCount, zeroIndexedTileCount);
	assert.equal(result[0], expectedX, 'Lowest map view start position. Check highest mapview x pos ' + highestLocalXPos + ' resolves to the correct global postion: ' + expectedX);
	assert.equal(result[1], expectedY, 'Lowest map view start position. Check highest mapview y pos ' + highestLocalXPos + ' resolves to the correct global postion: ' + expectedY);

	// Try moving the map view forward as far as possible
	let furthestForwardXViewPos = Math.floor(globalMapEndX / 2);
	let furthestForwardXYiewPos = Math.floor(globalMapEndY / 2);
	console.log(' Checking furthest forward map view position: ' + furthestForwardXViewPos + ', ' + furthestForwardXYiewPos);
	mapController.setMapViewPosition(furthestForwardXViewPos, furthestForwardXYiewPos);

	result = mapPositionHelper.localTilePosToGlobal(zeroIndexedTileCount / 2, zeroIndexedTileCount / 2);
	assert.equal(result[0], globalMapEndX, 'Highest map view start position. Check highest mapview x pos ' + highestLocalXPos + ' resolves to the correct global postion: ' + expectedX);
	assert.equal(result[1], globalMapEndY, 'Highest map view start position. Check highest mapview y pos ' + highestLocalXPos + ' resolves to the correct global postion: ' + expectedY);
}
);

QUnit.test(POSITION_TEST_TAG + 'local-to-global-invalid', function (assert) {
	let nonRelativeErrror = 'Local tile pos for conversion not relative to the map view';

	let mapSizes = mapController.getMap().getMapSizes();
	let mapSizeX = mapSizes[0];
	let mapSizeY = mapSizes[1];

	let mapViewStartPos = mapController.getPixiMapView().getMapViewStartPosition();
	let mapViewStartX = mapViewStartPos[0];
	let mapViewStartY = mapViewStartPos[1];

	// Call our utility method to check these args throw a RangeError with or expected Error
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0 - mapViewStartX - 1, 0, nonRelativeErrror);
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0, 0 - mapViewStartY - 1, nonRelativeErrror);

	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, tileCount, 0, nonRelativeErrror);
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0, tileCount, nonRelativeErrror);

	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0 - mapViewStartX, 0 - mapViewStartY, nonRelativeErrror);

	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, tileCount, tileCount, nonRelativeErrror);

	//	Overworld pos oveerrun
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, mapSizeX - mapViewStartX + 1, 0, nonRelativeErrror);
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0, mapSizeY - mapViewStartY + 1, nonRelativeErrror);

	//	Overworld pos underrun
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0 - (mapViewStartX + 1), 0, nonRelativeErrror);
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0, 0 - (mapViewStartY + 1), nonRelativeErrror);
}
);

// Test that a global position can be converted to a map-view local position
QUnit.test(POSITION_TEST_TAG + 'global-to-local-valid', function (assert) {
	let mapViewStartPos = mapController.getPixiMapView().getMapViewStartPosition();
	let mapViewStartX = mapViewStartPos[0];
	let mapViewStartY = mapViewStartPos[1];

  //	Lowest possible X
	let result = mapPositionHelper.globalTilePosToLocal(mapViewStartX, mapViewStartY);
	assert.equal(result[0], 0, 'Expect global x pos at start of map view: ' + mapViewStartX + ' to resolve to local position 0');
	assert.equal(result[1], 0, 'Expect global y pos at start of map view: ' + mapViewStartY + ' to resolve to local position 0');

	//	Highest possible (-1 for zero indexing)
	let zeroIndexedTileCount = mapController.getMap().tileCount - 1;
	result = mapPositionHelper.globalTilePosToLocal(zeroIndexedTileCount + mapViewStartX, zeroIndexedTileCount + mapViewStartY);
	assert.equal(result[0], zeroIndexedTileCount, 'Expect global x pos at end of map view: ' + zeroIndexedTileCount + ' to resolve to local position 0');
	assert.equal(result[1], zeroIndexedTileCount, 'Expect global y pos at end of map view: ' + zeroIndexedTileCount + ' to resolve to local position 0');
}
);

QUnit.test(POSITION_TEST_TAG + 'global-to-local-invalid', function (assert) {
	let tilePositionInvalidError = 'Global tile pos for conversion not in the global map';

	let mapViewStartPos = mapController.getPixiMapView().getMapViewStartPosition();
	let mapViewStartX = mapViewStartPos[0];
	let mapViewStartY = mapViewStartPos[1];

	let mapSizes = mapController.getMap().getMapSizes();
	let mapSizeX = mapSizes[0];
	let mapSizeY = mapSizes[1];

	let globalToLocalXOver = mapViewStartX + mapSizeX + 1;
	let globalToLocalYOver = mapViewStartY + mapSizeY + 1;
	let globalToLocalXUnder = mapViewStartX - 1;
	let globalToLocalYUnder = mapViewStartY - 1;

	//	X over by 1
	testPositionRangeError(assert, mapPositionHelper.globalTilePosToLocal, mapPositionHelper, globalToLocalXOver, mapViewStartY, tilePositionInvalidError);
	//	Y over by 1
	testPositionRangeError(assert, mapPositionHelper.globalTilePosToLocal, mapPositionHelper, mapViewStartX, globalToLocalYOver, tilePositionInvalidError);
	//	X and Y over by 1
	testPositionRangeError(assert, mapPositionHelper.globalTilePosToLocal, mapPositionHelper, globalToLocalXOver, globalToLocalYOver, tilePositionInvalidError);

	//	X under by 1
	testPositionRangeError(assert, mapPositionHelper.globalTilePosToLocal, mapPositionHelper, globalToLocalXUnder, mapViewStartY, tilePositionInvalidError);
	//	Y under by 1
	testPositionRangeError(assert, mapPositionHelper.globalTilePosToLocal, mapPositionHelper, mapViewStartX, globalToLocalYUnder, tilePositionInvalidError);
	//	X and Y under by 1
	testPositionRangeError(assert, mapPositionHelper.globalTilePosToLocal, mapPositionHelper, globalToLocalXUnder, globalToLocalYUnder, tilePositionInvalidError);
}
);

//	Tests conversion of a tile index e.g 2, 2 to pixi pixel co-ords
QUnit.test(POSITION_TEST_TAG + 'tile-to-pixi-valid', function (assert) {
	//	Lowest possible tile pos co-ord
	let result = mapPositionHelper.tileCoordToPixiPos(0, 0);
	assert.equal(result[0], 0, 'Check local position 0,0 resolves to pixi pixel x position 0');
	assert.equal(result[1], 0, 'Check local position 0,0 resolves to pixi pixel y position 0');

	//	Check x co-ord is independant from y, and the next tile over gives the starting pos (top-left) of the tile
	result = mapPositionHelper.tileCoordToPixiPos(1, 0);
	assert.equal(result[0], tileSize, 'Check local position 1,0 resolves to pixi pixel x position: ' + tileSize);
	assert.equal(result[1], 0, 'Check local position 1,0 resolves to pixi pixel y position 0');

	//	Check y co-ord is independant from x, and the next tile over gives the starting pos (top-left) of the tile
	result = mapPositionHelper.tileCoordToPixiPos(0, 1);
	assert.equal(result[0], 0, 'Check local position 0,1 resolves to pixi pixel x position 0');
	assert.equal(result[1], tileSize, 'Check local position 0,1 resolves to pixi pixel y position: ' + tileSize);

	//	Furthest co-ord possible
	let furthestTilePos = (tileCount - 1);
	let furthestPixiPos = (furthestTilePos * tileSize);
	console.log('furthestPixiPos: ' + furthestPixiPos);

	// Furthest tile x pos to pixi pos
	result = mapPositionHelper.tileCoordToPixiPos(furthestTilePos, 0);
	assert.equal(result[0], furthestPixiPos, 'Check tile position: ' + furthestTilePos + ',0 resolves to pixi pixel x pos: ' + furthestPixiPos);
	assert.equal(result[1], 0, 'Check tile position: ' + furthestTilePos + ',0 resolves to pixi pixel y pos 0');

	// Furthest tile y pos to pixi pos
	result = mapPositionHelper.tileCoordToPixiPos(furthestTilePos, 0);
	assert.equal(result[0], 0, 'Check tile position: 0,' + furthestTilePos + ' resolves to pixi pixel Y pos 0');
	assert.equal(result[1], furthestPixiPos, 'Check tile position: ' + furthestTilePos + ',0 resolves to pixi pixel y pos: ' + furthestPixiPos);

	// Furthest tile x and y pos to pixi pos
	result = mapPositionHelper.tileCoordToPixiPos(furthestTilePos, furthestTilePos);
	assert.equal(result[0], furthestPixiPos, 'Check tile position: ' + furthestTilePos + ',' + furthestTilePos + ' resolves to pixi pixel x pos: ' + furthestPixiPos);
	assert.equal(result[1], furthestPixiPos, 'Check tile position: ' + furthestTilePos + ',' + furthestTilePos + ' resolves to pixi pixel y pos: ' + furthestPixiPos);
}
);

QUnit.test(POSITION_TEST_TAG + 'tile-to-pixi-invalid', function (assert) {
	let tilePositionInvalidError = 'Tile-to-Pixi conversion, tile position invalid!';

	//	Negative relative positions should fail
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, -1, -1, tilePositionInvalidError);
	//	Furthest co-ord possible +1 should fail (not using -1 to tileCount)
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, tileCount, tileCount, tilePositionInvalidError);

	//	Check x co-ord is independant from y for failure
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, -1, 0, tilePositionInvalidError);
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, tileCount, 0, tilePositionInvalidError);

	//	Check y co-ord is independant from x for failure
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, 0, -1, tilePositionInvalidError);
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, 0, tileCount, tilePositionInvalidError);
}
);

// Converting from an arbitrary pixel co-ord to a tile co-ord
QUnit.test(POSITION_TEST_TAG + 'pixi-to-tile-valid', function (assert) {
	//	Lowest possible tile pos co-ord
	let result = mapPositionHelper.pixiPosToTileCoord(0, 0);
	assert.equal(result[0], 'Check pixi pixel position 0,0 resolves to tile x pos 0');
	assert.equal(result[1], 'Check pixi pixel position 0,0 resolves to tile y pos 0');

	let onePixelOverFirstTile = tileSize + 1

	//	Check x co-ord is independant from y, and 1 pixel over the tileSize gives the next tile
	result = mapPositionHelper.pixiPosToTileCoord(onePixelOverFirstTile, 0);
	assert.equal(result[0], 1, 'Check pixi pixel position ' + onePixelOverFirstTile + ',' + 0 + ' resolves to tile x pos 1');
	assert.equal(result[1], 0, 'Check pixi pixel position ' + onePixelOverFirstTile + ',' + 0 + ' resolves to tile y pos 0');

	//	Check y co-ord is independant from x, and 1 pixel over the tileSize gives the next tile
	result = mapPositionHelper.pixiPosToTileCoord(0, onePixelOverFirstTile);
	assert.equal(result[0], 0, 'Check pixi pixel position ' + 0 + ',' + onePixelOverFirstTile + ' resolves to tile x pos 0');
	assert.equal(result[1], 1, 'Check pixi pixel position ' + 0 + ',' + onePixelOverFirstTile + ' resolves to tile y pos 1');

	//	Check x and y co-ords
	result = mapPositionHelper.pixiPosToTileCoord(onePixelOverFirstTile, onePixelOverFirstTile);
	assert.equal(result[0], 1, 'Check pixi pixel position ' + onePixelOverFirstTile + ',' + onePixelOverFirstTile + ' resolves to tile x pos 1');
	assert.equal(result[1], 1, 'Check pixi pixel position ' + onePixelOverFirstTile + ',' + onePixelOverFirstTile + ' resolves to tile y pos 1');

	//	Furthest pixel co-ord possible
	let furthestPixiPos = (tileCount - 1) * tileSize;
	let furthestTilePos = furthestPixiPos / tileSize;
	result = mapPositionHelper.pixiPosToTileCoord(furthestPixiPos, furthestPixiPos);
	assert.equal(result[0], furthestTilePos, 'Check furthest pixi position ' + furthestPixiPos + ',' + furthestPixiPos + ' resolves to furthest tile x pos ' + furthestTilePos);
	assert.equal(result[1], furthestTilePos, 'Check furthest pixi position ' + furthestPixiPos + ',' + furthestPixiPos + ' resolves to furthest tile y pos ' + furthestTilePos);
}
);

QUnit.test(POSITION_TEST_TAG + 'pixi-to-tile-invalid', function (assert) {
	let invalidPixiPosError = 'Pixi-to-Tile conversion, pixi position invalid!';
	//	Independant x under range
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, -1, 0, invalidPixiPosError);
	//	Independant y under range
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, 0, -1, invalidPixiPosError);
	//	x and y under range
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, -1, -1, invalidPixiPosError);

	//	Over max pixi pos by 1 pixel
	let furthestPixiPosJustOver = tileCount * tileSize + 1;

	//	Independant x over range by 1 pixelj
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, furthestPixiPosJustOver, 0, invalidPixiPosError);
	//	Independant y over range by 1 pixel
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, 0, furthestPixiPosJustOver, invalidPixiPosError);
	//	x and y over range
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, furthestPixiPosJustOver, furthestPixiPosJustOver, invalidPixiPosError);
}
);