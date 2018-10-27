import MapController from 'src/controller/pixi/MapController.js';

import { testPositionRangeError, rangeErrorString } from 'test/helper/PositionHelperTests.js';

// Extract the map model from our controller
var mapModel = MapController.mapModel;

var MAPCONTROLLER_TEST_TAG = '|MAP CONTROLLER|';

QUnit.test(MAPCONTROLLER_TEST_TAG + 'set-map-view-position-valid', function (assert) {
	//	Smallest global position valid
	MapController.setMapViewPosition(0, 0);
	assert.equal(mapModel.mapViewStartX, 0);
	assert.equal(mapModel.mapViewStartY, 0);

	var lowestRange = -mapModel.halfTileCountFloored;
	//	Smallest relative position (minus half the tilecount)
	MapController.setMapViewPosition(lowestRange, lowestRange);
	assert.equal(mapModel.mapViewStartX, lowestRange);
	assert.equal(mapModel.mapViewStartY, lowestRange);

	var tileCountZeroIndexedLen = mapModel.tileCount - 1;
	//	Largest global position valid
	MapController.setMapViewPosition(tileCountZeroIndexedLen, tileCountZeroIndexedLen);
	assert.equal(mapModel.mapViewStartX, tileCountZeroIndexedLen);
	assert.equal(mapModel.mapViewStartY, tileCountZeroIndexedLen);
}
);

QUnit.test(MAPCONTROLLER_TEST_TAG + 'set-map-view-position-invalid', function (assert) {
	var justUnderRange = -mapModel.halfTileCountFloored - 1;
	var lowestRange = -mapModel.halfTileCountFloored;

	//	Independant x under range (Map view should allow halfTileCountFloored offset)
	testPositionRangeError(assert, MapController.setMapViewPosition, justUnderRange, lowestRange, new RangeError(rangeErrorString(justUnderRange, lowestRange)));
	//	Independant y under range
	testPositionRangeError(assert, MapController.MapController.setMapViewPosition, lowestRange, justUnderRange, new RangeError(rangeErrorString(lowestRange, justUnderRange)));
	//	X and Y under range
	testPositionRangeError(assert, MapController.setMapViewPosition, justUnderRange, justUnderRange, new RangeError(rangeErrorString(justUnderRange, justUnderRange)));

	// "Local tile pos for conversion not relative to the map view"
	//	Independant x over range
	testPositionRangeError(assert, MapController.setMapViewPosition, mapModel.mapSizeX, 0, new RangeError(rangeErrorString(mapModel.mapSizeX, 0)));
	//	Independant y over range
	testPositionRangeError(assert, MapController.setMapViewPosition, 0, mapModel.mapSizeY, new RangeError(rangeErrorString(0, mapModel.mapSizeY)));
	//	X and Y over range
	testPositionRangeError(assert, MapController.setMapViewPosition, mapModel.mapSizeX, mapModel.mapSizeY, new RangeError(rangeErrorString(mapModel.mapSizeX, mapModel.mapSizeY)));

	assert.expect(6); //  Expect Error assertions for every test
}
);
