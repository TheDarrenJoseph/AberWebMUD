import Map from 'src/model/Map.js';
import PixiMapView from 'src/view/pixi/PixiMapView.js';

import { DEFAULT_TILE_SIZE } from 'src/view/pixi/PixiMapView.js';
import { DEFAULT_MAP_SIZE_XY } from 'src/model/Map.js';

import { MapController } from 'src/controller/MapController.js';
import { testPositionRangeError } from 'test/utils/PositionTestHelper.js';
import { PixiView } from 'src/view/pixi/PixiView.js';
import { PixiController } from 'src/controller/pixi/PixiController.js';

import { POS_LOCAL_TO_GLOBAL_LOCAL_INVALID_START, POS_TILE_TO_PIXI_INVALID_PIXI_ERROR } from 'src/helper/MapPositionHelper.js';

var POSITION_TEST_TAG = '|MAP-POSITION-HELPER|';

// Enough pixels for 20 tiles
let testTileCount = 20;
let testWindowSize = DEFAULT_TILE_SIZE * testTileCount;

// We'll initialise each of these before each test to have fresh objects
let pixiView = null;
let renderer = null;
let mapModel = null;
let pixiMapView = null;
let mapController = null;
let mapViewTilecount = null;
let mapPositionHelper = null;
let tileSize = null;

// Setup / assertions before any test runs
function beforeAll (assert) {
	// SOME STUFF
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Re-initialise our classes
	pixiView = new PixiView();
	renderer = pixiView.getRenderer();
	mapModel = new Map(20);
	pixiMapView = new PixiMapView(mapModel, null, renderer, null, testWindowSize);
	mapController = new MapController(renderer, mapModel, pixiMapView);

	mapViewTilecount = mapController.getPixiMapView().getTilecount();
	mapPositionHelper = mapController.getPositionHelper();
	tileSize = mapController.getPixiMapView().tileSize;

	// Some simple assertions for the default state of these
	let mapViewStartPos = pixiMapView.getMapViewStartPosition();
	assert.equal(mapViewStartPos[0], 0);
	assert.equal(mapViewStartPos[1], 0);

	let mapSizes = mapController.getMap().getMapSizes();
	assert.equal(mapSizes[0], DEFAULT_MAP_SIZE_XY);
	assert.equal(mapSizes[1], DEFAULT_MAP_SIZE_XY);

	assert.equal(mapViewTilecount, DEFAULT_MAP_SIZE_XY);
}

// Hookup before each test setup / assertion
QUnit.module('viewPositionTests', { before: beforeAll, beforeEach: beforeEachTest });

//	Testing relative co-ords (tile view co-ords) that are 0 indexed
QUnit.test(POSITION_TEST_TAG + 'relative-to-view-valid', function (assert) {
	//	Lowest possible
	assert.ok(pixiMapView.isPositionRelativeToView(0, 0), 'Checking validity of map view position 0,0');
	//	Highest possible (-1 for 0 indexing)
	let largestPos = mapViewTilecount - 1;
	assert.ok(pixiMapView.isPositionRelativeToView(largestPos, largestPos), 'Checking validity of largest map view pos ' + largestPos + ',' + largestPos);
}
);

QUnit.test(POSITION_TEST_TAG + 'relative-to-view-invalid', function (assert) {
	let justOverTileCount = mapViewTilecount + 1;

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
	assert.ok(pixiMapView.isGlobalPositionInMapView(mapStartX, mapStartY), 'Check lowest valid map view range: ' + mapStartX + ',' + mapStartY);

	// Calculate the end of our map-view (bottom-right)
	let tileCountIncrement = mapViewTilecount - 1;
	let topRangeX = mapStartX + tileCountIncrement;
	let topRangeY = mapStartX + tileCountIncrement;

	// Highest range possible
	assert.ok(
		pixiMapView.isGlobalPositionInMapView(topRangeX,
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
	let xBoundOver = mapViewStartX + mapViewTilecount + 1;
	let yBoundOver = mapViewStartY + mapViewTilecount + 1;

	assert.notOk(pixiMapView.isGlobalPositionInMapView(xBoundUnder, mapViewStartY), 'Check mapview x bound under range: ' + xBoundUnder + ',' + mapViewStartY);
	assert.notOk(pixiMapView.isGlobalPositionInMapView(mapViewStartX, yBoundUnder), 'Check mapview y bound under range: ' + mapViewStartX + ',' + yBoundUnder);
	assert.notOk(pixiMapView.isGlobalPositionInMapView(-1, -1), 'Check mapview x and y bound under range: ' + xBoundUnder + ',' + mapViewStartY);

	assert.notOk(pixiMapView.isGlobalPositionInMapView(-1, mapViewStartY), 'Check mapview negative x is invalid: ' + -1 + ',' + 0);
	assert.notOk(pixiMapView.isGlobalPositionInMapView(mapViewStartX, -1), 'Check mapview negative y is invalid:  ' + 0 + ',' + -1);
	assert.notOk(pixiMapView.isGlobalPositionInMapView(-1, -1), 'Check mapview negative x and y is invalid ' + xBoundUnder + ',' + mapViewStartY);

	assert.notOk(pixiMapView.isGlobalPositionInMapView(xBoundOver, mapViewStartY), 'Check mapview x bound over range: ' + xBoundOver + ',' + mapViewStartY);
	assert.notOk(pixiMapView.isGlobalPositionInMapView(mapViewStartX, yBoundOver), 'Check mapview y bound over range: ' + mapViewStartX + ',' + yBoundOver);
	assert.notOk(pixiMapView.isGlobalPositionInMapView(xBoundOver, yBoundOver), 'Check mapview x and y bound over range: ' + xBoundOver + ',' + yBoundOver);
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
	console.log('local to global 0,0 conversion result: ' + result);
	assert.deepEqual(result, [mapViewStartX, mapViewStartY], 'Check local mapview position 0, 0 resolves to mapview start pos');

	//	2. Highest possible local position with an offset (-1 for zero indexing)

	let highestViewPos = pixiMapView.getHighestInMapPosition();
	let expectedGlobalPos = highestViewPos; // Map view starts at 0
	result = mapPositionHelper.localTilePosToGlobal(highestViewPos[0], highestViewPos[1]);
	assert.deepEqual(result, expectedGlobalPos, 'Check highest mapview pos ' + highestViewPos + ' resolves to the correct global postion: ' + expectedGlobalPos);
}
);

//	Test conversion of a window-local co-ordinate to a map global position
//  e.g the top-left corner 0, 0 could be on tile 20 of the map
// Also setting the map view to half under/overhang by the view's tileCount
QUnit.test(POSITION_TEST_TAG + 'local-to-global-valid-moving-view', function (assert) {

	// Should have 20 tiles
	assert.deepEqual(pixiMapView.tileCount, 20, 'Check mapview tilecount');
	assert.deepEqual(pixiMapView.zeroIndexedTileCount, 19, 'Check mapview zero-indexed tilecount');
	assert.deepEqual(pixiMapView.halfZeroIndexedTileCountFloored, 9, 'Check mapview zero-indexed tilecount');
	assert.deepEqual(pixiMapView.halfZeroIndexedTileCountCeiled, 10, 'Check mapview zero-indexed tilecount');

	// Starting at 0.0 pos
	assert.deepEqual(pixiMapView.getMapViewStartPosition(), [0, 0], 'Check mapview start position.');

	let furthestBackwardViewPos = pixiMapView.mapViewMinPosition;
	let furthestForwardViewPos = pixiMapView.mapViewMaxPosition

	// minus 9 or plus 9
	assert.deepEqual(furthestBackwardViewPos, [-9, -9], 'Check furthest backwards position is as expected.');
	assert.deepEqual(furthestForwardViewPos, [9, 9], 'Check furthest forward pos is as expected.');

	// 1. Try moving the map view back as far as possible;
	console.log('Checking furthest back map view position: ' + furthestBackwardViewPos);
	mapController.setMapViewPosition(furthestBackwardViewPos[0], furthestBackwardViewPos[1]);
	let highestViewPos = mapController.getPixiMapView().getHighestInMapPosition();
	assert.deepEqual(highestViewPos, [19, 19], 'Check theres 10 tiles at the end of the map view. Ending at pos 19,19');
	let lowestViewPos = mapController.getPixiMapView().getLowestInMapPosition();
	assert.deepEqual(lowestViewPos, [9, 9], 'Check theres 10 tiles at the end of the map view. Starting from pos 9,9');

	// At pos -9 -9 there should be 9 tiles before the map start, and 11 after, so pos 10 is the end
	let result = mapPositionHelper.localTilePosToGlobal(19, 19);
	assert.deepEqual(result, [10, 10], 'Pos 19, 19 should be tile pos 9,9 on the global map.');
	result = mapPositionHelper.localTilePosToGlobal(9, 9);
	assert.deepEqual(result, [0, 0], 'Pos 9, 9 should be tile pos 0,0 on the global map.');

}
);

QUnit.test(POSITION_TEST_TAG + 'local-to-global-invalid', function (assert) {
	let nonRelativeErrror = POS_LOCAL_TO_GLOBAL_LOCAL_INVALID_START;

	let mapSizes = mapController.getMap().getMapSizes();
	assert.deepEqual(mapSizes, [20, 20], 'Map sizes should be 20, 20');
	let mapSizeX = mapSizes[0];
	let mapSizeY = mapSizes[1];

	let mapViewStartPos = mapController.getPixiMapView().getMapViewStartPosition();
	assert.deepEqual(mapViewStartPos, [0, 0], 'Map view should start at pos 0,0');
	let mapViewStartX = mapViewStartPos[0];
	let mapViewStartY = mapViewStartPos[1];

	// Call our utility method to check these args throw a RangeError with or expected Error
	// -1 should always be invalid
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, -1, 0, nonRelativeErrror);
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0, -1, nonRelativeErrror);
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, -1, -1, nonRelativeErrror);

	// 1 over tileCount (it's not zero-indexed)
	assert.equal(mapViewTilecount, 20, 'Check map view tile count is not zero indexed (I wanna make errors happen!)');
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, mapViewTilecount, 0, nonRelativeErrror);
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0, mapViewTilecount, nonRelativeErrror);

	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, mapViewTilecount, mapViewTilecount, nonRelativeErrror);

	//	Overworld pos oveerrun
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, mapViewStartX + mapSizeX, 0, nonRelativeErrror);
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0, mapViewStartY + mapSizeY, nonRelativeErrror);

	//	Overworld pos underrun
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0 - (mapViewStartX + 1), 0, nonRelativeErrror);
	testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0, 0 - (mapViewStartY + 1), nonRelativeErrror);
}
);

// Test that a global position can be converted to a map-view local position
QUnit.test(POSITION_TEST_TAG + 'global-to-local-valid', function (assert) {
	let mapViewStartPos = mapController.getPixiMapView().getMapViewStartPosition();
	assert.deepEqual(mapViewStartPos, [0, 0], 'Map view should start at pos 0,0');

  //	Lowest possible X
	let result = mapPositionHelper.globalTilePosToLocal(0, 0);
	assert.deepEqual(result, [0, 0], 'Expect global pos 0, 0 at start of map view  to resolve to local position 0,0');

	//	Highest possible (-1 for zero indexing)
	let zeroIndexedTileCount = mapController.getPixiMapView().zeroIndexedTileCount;
	result = mapPositionHelper.globalTilePosToLocal(zeroIndexedTileCount, zeroIndexedTileCount);
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
	let furthestTilePos = mapController.getPixiMapView().zeroIndexedTileCount;
	let furthestPixiPos = (furthestTilePos * tileSize);
	console.log('furthestPixiPos: ' + furthestPixiPos);

	// Check furthest x,y positions
	// Furthest tile x pos to pixi pos
	result = mapPositionHelper.tileCoordToPixiPos(furthestTilePos, 0);
	assert.deepEqual(result, [furthestPixiPos, 0], 'Check furthest tile x pos to pixi pixel pos.');
	// Furthest tile y pos to pixi pos
	result = mapPositionHelper.tileCoordToPixiPos(0, furthestTilePos);
	assert.deepEqual(result, [0, furthestPixiPos], 'Check furthest tile y pos to pixi pixel pos.');
	// Furthest tile x and y pos to pixi pos
	result = mapPositionHelper.tileCoordToPixiPos(furthestTilePos, furthestTilePos);
	assert.deepEqual(result, [furthestPixiPos, furthestPixiPos], 'Check furthest tile xy pos to pixi pixel pos.');
}
);

QUnit.test(POSITION_TEST_TAG + 'tile-to-pixi-invalid', function (assert) {
	let tilePositionInvalidError = 'Tile-to-Pixi conversion, tile position invalid!';

	//	Negative relative positions should fail
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, -1, -1, tilePositionInvalidError);
	//	Furthest co-ord possible +1 should fail (not using -1 to tileCount)
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, mapViewTilecount, mapViewTilecount, tilePositionInvalidError);

	//	Check x co-ord is independant from y for failure
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, -1, 0, tilePositionInvalidError);
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, mapViewTilecount, 0, tilePositionInvalidError);

	//	Check y co-ord is independant from x for failure
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, 0, -1, tilePositionInvalidError);
	testPositionRangeError(assert, mapPositionHelper.tileCoordToPixiPos, mapPositionHelper, 0, mapViewTilecount, tilePositionInvalidError);
}
);

// Converting from an arbitrary pixel co-ord to a tile co-ord
QUnit.test(POSITION_TEST_TAG + 'pixi-to-tile-valid', function (assert) {
	//	Lowest possible tile pos co-ord
	let result = mapPositionHelper.pixiPosToTileCoord(0, 0);
	assert.deepEqual(result, [0, 0], 'Check pixi pixel position 0,0 resolves to tile pos 0,0');

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
	let furthestPixiPos = (mapViewTilecount - 1) * tileSize;
	let furthestTilePos = furthestPixiPos / tileSize;
	result = mapPositionHelper.pixiPosToTileCoord(furthestPixiPos, furthestPixiPos);
	assert.equal(result[0], furthestTilePos, 'Check furthest pixi position ' + furthestPixiPos + ',' + furthestPixiPos + ' resolves to furthest tile x pos ' + furthestTilePos);
	assert.equal(result[1], furthestTilePos, 'Check furthest pixi position ' + furthestPixiPos + ',' + furthestPixiPos + ' resolves to furthest tile y pos ' + furthestTilePos);
}
);

QUnit.test(POSITION_TEST_TAG + 'pixi-to-tile-invalid', function (assert) {
	let invalidPixiPosError = POS_TILE_TO_PIXI_INVALID_PIXI_ERROR;
	//	Independant x under range
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, -1, 0, invalidPixiPosError);
	//	Independant y under range
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, 0, -1, invalidPixiPosError);
	//	x and y under range
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, -1, -1, invalidPixiPosError);

	//	Over max pixi pos by 1 pixel
	let furthestPixiPosJustOver = mapViewTilecount * tileSize + 1;

	//	Independant x over range by 1 pixelj
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, furthestPixiPosJustOver, 0, invalidPixiPosError);
	//	Independant y over range by 1 pixel
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, 0, furthestPixiPosJustOver, invalidPixiPosError);
	//	x and y over range
	testPositionRangeError(assert, mapPositionHelper.pixiPosToTileCoord, mapPositionHelper, furthestPixiPosJustOver, furthestPixiPosJustOver, invalidPixiPosError);
}
);
