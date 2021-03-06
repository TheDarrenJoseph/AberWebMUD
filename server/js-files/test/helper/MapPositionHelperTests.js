import PixiMapView from 'src/view/pixi/PixiMapView.js';

import { MapModel, DEFAULT_MAP_SIZE_XY, DEFAULT_TILE_SIZE } from 'src/model/pixi/map/MapModel.js';

import MapController from 'src/controller/MapController.js';
import { testPositionRangeError } from 'test/utils/PositionTestHelper.js';
import { PixiView } from 'src/view/pixi/PixiView.js';
import { ASSET_PATHS } from 'src/controller/pixi/PixiController.js';

import { POS_LOCAL_TO_GLOBAL_LOCAL_INVALID_START, POS_TILE_TO_PIXI_INVALID_PIXI_ERROR } from 'src/helper/MapPositionHelper.js';

import { PageView } from 'src/view/page/PageView.js';

var TEST_TAG = '|MAP-POSITION-HELPER|';

// Enough pixels for 20 tiles
let TEST_TILECOUNT = 20;
let TEST_WINDOW_SIZE = DEFAULT_TILE_SIZE * TEST_TILECOUNT;

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
	pixiView = new PixiView(undefined, undefined, ASSET_PATHS);
	renderer = pixiView.getRenderer();
	mapModel = new MapModel(DEFAULT_MAP_SIZE_XY);
	pixiMapView = new PixiMapView(mapModel, renderer, TEST_WINDOW_SIZE, DEFAULT_TILE_SIZE, ASSET_PATHS);
	mapController = new MapController(renderer, mapModel, TEST_WINDOW_SIZE, DEFAULT_TILE_SIZE, pixiMapView, ASSET_PATHS);

	mapViewTilecount = mapController.getPixiMapView().getTilecount();
	assert.equal(mapViewTilecount, TEST_TILECOUNT, 'Check Pixi map view tilecount is the test tilecount.');

	mapPositionHelper = mapController.getPositionHelper();
	tileSize = mapController.getPixiMapView().tileSize;

	// Some simple assertions for the default state of these
	let mapViewStartPos = pixiMapView.getMapViewStartPosition();
	assert.deepEqual([mapViewStartPos[0], mapViewStartPos[1]], [0,0]);

	// Check map size
	let mapSizes = mapController.getMap().getMapSizes();
	assert.deepEqual( [mapSizes[0], mapSizes[1]], [TEST_TILECOUNT, TEST_TILECOUNT]);
}

// Hookup before each test setup / assertion
QUnit.module('MapPositionHelperTests', { before: beforeAll, beforeEach: beforeEachTest }, () => {

//	Test conversion of a window-local co-ordinate to a map global position
//  e.g the top-left corner 0, 0 could be on tile 20 of the map
	QUnit.test(TEST_TAG + 'local-to-global-valid', function (assert) {
		let mapViewStartPos = mapController.getPixiMapView().getMapViewStartPosition();
		assert.deepEqual(mapViewStartPos, [0, 0], 'Check map view starting positions are zero.');

		//	Local position (relative to view) is 0-tilecount-1, global = X or Y+XYoffset
		//	1. Lowest possible local position
		let result = mapPositionHelper.localTilePosToGlobal(0, 0);
		// console.log('local to global 0,0 conversion result: ' + result);
		assert.deepEqual(result, [0, 0], 'Check local mapview position 0, 0 resolves to mapview start pos');

		//	2. Highest possible local position with an offset (-1 for zero indexing)
		let expectedGlobalPos = [19, 19];
		let highestViewPos = pixiMapView.getHighestInMapPosition();
		assert.deepEqual(highestViewPos, expectedGlobalPos, 'Check highest mapview pos ' + highestViewPos + ' resolves to the correct global postion: ' + expectedGlobalPos);

		result = mapPositionHelper.localTilePosToGlobal(highestViewPos[0], highestViewPos[1]);
		assert.deepEqual(result, expectedGlobalPos, 'Check highest mapview pos ' + highestViewPos + ' resolves to the correct global postion: ' + expectedGlobalPos);
	}
	);

//	Test conversion of a window-local co-ordinate to a map global position
//  e.g the top-left corner 0, 0 could be on tile 20 of the map
// Also setting the map view to half under/overhang by the view's tileCount
	QUnit.test(TEST_TAG + 'local-to-global-valid-moving-view', function (assert) {

		// Should have 20 tiles
		assert.deepEqual(pixiMapView.tileCount, 20, 'Check mapview tilecount');
		assert.deepEqual(pixiMapView.zeroIndexedTileCount, 19, 'Check mapview zero-indexed tilecount');
		assert.deepEqual(pixiMapView.halfZeroIndexedTileCountFloored, 9, 'Check mapview zero-indexed tilecount');
		assert.deepEqual(pixiMapView.halfZeroIndexedTileCountCeiled, 10, 'Check mapview zero-indexed tilecount');

		// Starting at 0.0 pos
		assert.deepEqual(pixiMapView.getMapViewStartPosition(), [0, 0], 'Check mapview start position.');

		let furthestBackwardViewPos = pixiMapView.mapViewMinPosition;
		let furthestForwardViewPos = pixiMapView.mapViewMaxPosition;

		// minus 9 or plus 9
		assert.deepEqual(furthestBackwardViewPos, [-9, -9], 'Check furthest backwards position is as expected.');
		assert.deepEqual(furthestForwardViewPos, [11, 11], 'Check furthest forward pos is as expected.');

		// 1. Try moving the map view back as far as possible;
		// console.log('Checking furthest back map view position: ' + furthestBackwardViewPos);
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

	QUnit.test(TEST_TAG + 'local-to-global-invalid', function (assert) {
		let nonRelativeErrror = POS_LOCAL_TO_GLOBAL_LOCAL_INVALID_START;

		let mapSizes = mapController.getMap().getMapSizes();
		assert.deepEqual(mapSizes, [20, 20], 'Map sizes should be 20, 20');
		let mapSizeX = mapSizes[0];
		let mapSizeY = mapSizes[1];

		let mapViewStartPos = mapController.getPixiMapView().getMapViewStartPosition();
		assert.deepEqual(mapViewStartPos, [0, 0], 'Map view should start at pos 0,0');
		let mapViewStartX = mapViewStartPos[0];
		let mapViewStartY = mapViewStartPos[1];

		// Call our utility method to check these args throw a RangeError with our expected Error
		// -1 should always be invalid
		testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, -1, 0, nonRelativeErrror);
		testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, 0, -1, nonRelativeErrror);
		testPositionRangeError(assert, mapPositionHelper.localTilePosToGlobal, mapPositionHelper, -1, -1, nonRelativeErrror);

		// 1 over tileCount (it's not zero-indexed)
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
	QUnit.test(TEST_TAG + 'global-to-local-valid', function (assert) {
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

	QUnit.test(TEST_TAG + 'global-to-local-invalid', function (assert) {
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
	QUnit.test(TEST_TAG + 'tile-to-pixi-valid', function (assert) {
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
		// console.log('furthestPixiPos: ' + furthestPixiPos);

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

	QUnit.test(TEST_TAG + 'tile-to-pixi-invalid', function (assert) {
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
	QUnit.test(TEST_TAG + 'pixi-to-tile-valid', function (assert) {
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

	QUnit.test(TEST_TAG + 'pixi-to-tile-invalid', function (assert) {
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
});