import PixiView from 'src/view/pixi/PixiView.js';

import { MapController, POS_NOT_VALID_MAP_VIEW_ERROR } from 'src/controller/MapController.js';
import { testPositionRangeError } from 'test/utils/PositionTestHelper.js';
import { ASSET_PATHS } from 'src/controller/pixi/PixiController.js';
import { PageView }  from 'src/view/page/PageView.js';

var MAPCONTROLLER_TEST_TAG = '|MAP CONTROLLER|';

// These must be EVEN for calculations
var TEST_WINDOWSIZE = 800;
var TEST_TILESIZE = 80;
// Window size / tile size.. So 10 tiles displayed
var TEST_MAPWINDOW_TILECOUNT = 10;

var pixiView = new PixiView(undefined, undefined, ASSET_PATHS);
var mapController;

var MAX_TIMEOUT = 2000;

// Setup / assertions before any test runs
function beforeAll (assert) {
	mapController = new MapController(pixiView.getRenderer(), undefined, TEST_WINDOWSIZE, TEST_TILESIZE , undefined, ASSET_PATHS);
	assert.equal(mapController.getPixiMapView().tileCount, TEST_MAPWINDOW_TILECOUNT, 'Check map view tile count is correct');
	assert.equal(mapController.getPixiMapView().tileSize, TEST_TILESIZE, 'Check map view tile size is correct');
	assert.equal(mapController.getPixiMapView().windowSize, TEST_WINDOWSIZE, 'Check map view window size is correct');
}

// Setup / assertions before each test
function beforeEachTest (assert) {

}

// Hookup before each test setup / assertion
QUnit.module('MapControllerTests', { before: beforeAll, beforeEach: beforeEachTest }, () => {

// Valid map view range is ( -halfZeroIndexedTileCountFloored to halfZeroIndexedTileCountFloored )
	QUnit.test(MAPCONTROLLER_TEST_TAG + 'showMapPosition-valid-smallestPos', function (assert) {
		// PixiMapView construction can be a little slow
		assert.timeout(MAX_TIMEOUT);
		//mapController.initialise();

		// 1.	Smallest global position valid
		mapController.showMapPosition(0, 0);

		let startPositions = mapController.getPixiMapView().getMapViewStartPosition();
		assert.equal(startPositions[0], 0, 'Map view start x should be 0');
		assert.equal(startPositions[1], 0, 'Map view start y should be 0');
	}
	);

// Valid map view range is ( -halfZeroIndexedTileCountFloored to halfZeroIndexedTileCountFloored )
	QUnit.test(MAPCONTROLLER_TEST_TAG + 'showMapPosition-valid_smallestRelative-halfUnderhanging-upperLeft', function (assert) {
		// PixiMapView construction can be a little slow
		assert.timeout(MAX_TIMEOUT);
		//mapController.initialise();

		// 2.	Smallest relative position negative 1/2 window tilecount
		let lowestRange = -mapController.getPixiMapView().halfZeroIndexedTileCountFloored;
		// console.log('Lowest map view overhang co-ords: ' + lowestRange + ',' + lowestRange);
		mapController.showMapPosition(lowestRange, lowestRange);
		let startPositions = mapController.getPixiMapView().getMapViewStartPosition();
		assert.equal(startPositions[0], lowestRange, 'Should be able to set Map View start to x pos to negative half tilecount: ' + lowestRange);
		assert.equal(startPositions[1], lowestRange, 'Should be able to set Map View start to y pos to negative half tilecount: ' + lowestRange);
	}
	);

// Valid map view range is ( -halfZeroIndexedTileCountFloored to halfZeroIndexedTileCountFloored )
	QUnit.test(MAPCONTROLLER_TEST_TAG + 'showMapPosition-valid-halfOverhanging-lowerRight', function (assert) {
		// PixiMapView construction can be a little slow
		assert.timeout(MAX_TIMEOUT);
		//mapController.initialise();

		let halfTilecountFloored = mapController.getPixiMapView().halfZeroIndexedTileCountFloored;
		console.log('Floored half tileCount: ' + halfTilecountFloored);

		// 3. Should be able to move the start of the view
		// to be 1/2 window tilecount away from the end of map
		let halfOverhangingX = (mapController.getMap().mapSizeX) - halfTilecountFloored;
		let halfOverhangingY = (mapController.getMap().mapSizeY) - halfTilecountFloored;
		// console.log('End of map view overhang co-ords: ' + halfOverhangingX + ',' + halfOverhangingY);

		mapController.showMapPosition(halfOverhangingX, halfOverhangingY);
		let startPositions = mapController.getPixiMapView().getMapViewStartPosition();
		assert.equal(startPositions[0], halfOverhangingX, 'Should be able to set Map View start to x pos: ' + halfOverhangingX);
		assert.equal(startPositions[1], halfOverhangingY, 'Should be able to set Map View start to y pos: ' + halfOverhangingY);
	}
	);

// Check we throw the expected range error for any invalid positions
	QUnit.test(MAPCONTROLLER_TEST_TAG + 'showMapPosition-invalid', async function (assert) {
		var justUnderRange = -mapController.getPixiMapView().halfZeroIndexedTileCountFloored - 1;
		var lowestRange = -mapController.getPixiMapView().halfZeroIndexedTileCountFloored;

		//	Independant x under range (Map view should allow halfZeroIndexedTileCountFloored offset)
		await testPositionRangeError(assert, mapController.showMapPosition, mapController, justUnderRange, lowestRange, POS_NOT_VALID_MAP_VIEW_ERROR);
		//	Independant y under range
		await testPositionRangeError(assert, mapController.showMapPosition, mapController, lowestRange, justUnderRange, POS_NOT_VALID_MAP_VIEW_ERROR);
		//	X and Y under range
		await testPositionRangeError(assert, mapController.showMapPosition, mapController, justUnderRange, justUnderRange, POS_NOT_VALID_MAP_VIEW_ERROR);

		// "Local tile pos for conversion not relative to the map view"
		//	Independant x over range
		await testPositionRangeError(assert, mapController.showMapPosition, mapController, mapController.mapModel.mapSizeX, 0, POS_NOT_VALID_MAP_VIEW_ERROR);
		//	Independant y over range
		await testPositionRangeError(assert, mapController.showMapPosition, mapController, 0, mapController.mapModel.mapSizeY, POS_NOT_VALID_MAP_VIEW_ERROR);
		//	X and Y over range
		await testPositionRangeError(assert, mapController.showMapPosition, mapController, mapController.mapModel.mapSizeX, mapController.mapModel.mapSizeY, POS_NOT_VALID_MAP_VIEW_ERROR);
	}
	);

});