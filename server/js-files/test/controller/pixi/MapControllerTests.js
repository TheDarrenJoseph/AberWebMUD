import PixiView from 'src/view/pixi/PixiView.js';

import { Map } from 'src/model/Map.js';
import { MapController, POS_NOT_VALID_MAP_VIEW_ERROR } from 'src/controller/MapController.js';
import { testPositionRangeError } from 'test/utils/PositionTestHelper.js';
import { ASSET_PATHS } from 'src/controller/pixi/PixiController.js';

var MAPCONTROLLER_TEST_TAG = '|MAP CONTROLLER|';

let pixiView = new PixiView();
let mapController = new MapController(pixiView.getRenderer(), undefined, null, ASSET_PATHS);

// Valid map view range is ( -halfZeroIndexedTileCountFloored to halfZeroIndexedTileCountFloored )
QUnit.test(MAPCONTROLLER_TEST_TAG + 'showMapPosition-valid', function (assert) {
	// 1.	Smallest global position valid
	mapController.showMapPosition(0, 0);
	let startPositions = mapController.getPixiMapView().getMapViewStartPosition();
	assert.equal(startPositions[0], 0, 'Map view start x should be 0');
	assert.equal(startPositions[1], 0, 'Map view start y should be 0');

	// 2.	Smallest relative position negative 1/2 window tilecount
	let lowestRange = -mapController.pixiMapView.halfZeroIndexedTileCountFloored;
	// console.log('Lowest map view overhang co-ords: ' + lowestRange + ',' + lowestRange);
	mapController.showMapPosition(lowestRange, lowestRange);
	startPositions = mapController.getPixiMapView().getMapViewStartPosition();
	assert.equal(startPositions[0], lowestRange, 'Should be able to set Map View start to x pos to negative half tilecount: ' + lowestRange);
	assert.equal(startPositions[1], lowestRange, 'Should be able to set Map View start to y pos to negative half tilecount: ' + lowestRange);

	// 3. Should be able to move the start of the view
	// to be 1/2 window tilecount away from the end of map
	let halfOverhangingX = mapController.getMap().mapSizeX - mapController.getPixiMapView().halfZeroIndexedTileCountFloored;
	let halfOverhangingY = mapController.getMap().mapSizeY - mapController.getPixiMapView().halfZeroIndexedTileCountFloored;
	// console.log('End of map view overhang co-ords: ' + halfOverhangingX + ',' + halfOverhangingY);

	mapController.showMapPosition(halfOverhangingX, halfOverhangingY);
	startPositions = mapController.getPixiMapView().getMapViewStartPosition();
	assert.equal(startPositions[0], halfOverhangingX, 'Should be able to set Map View start to x pos: ' + halfOverhangingX);
	assert.equal(startPositions[1], halfOverhangingY, 'Should be able to set Map View start to y pos: ' + halfOverhangingY);
}
);

// Check we throw the expected range error for any invalid positions
QUnit.test(MAPCONTROLLER_TEST_TAG + 'showMapPosition-invalid', function (assert) {
	var justUnderRange = -mapController.getPixiMapView().halfZeroIndexedTileCountFloored - 1;
	var lowestRange = -mapController.getPixiMapView().halfZeroIndexedTileCountFloored;

	//	Independant x under range (Map view should allow halfZeroIndexedTileCountFloored offset)
	testPositionRangeError(assert, mapController.showMapPosition, mapController, justUnderRange, lowestRange, POS_NOT_VALID_MAP_VIEW_ERROR);
	//	Independant y under range
	testPositionRangeError(assert, mapController.showMapPosition, mapController, lowestRange, justUnderRange, POS_NOT_VALID_MAP_VIEW_ERROR);
	//	X and Y under range
	testPositionRangeError(assert, mapController.showMapPosition, mapController, justUnderRange, justUnderRange, POS_NOT_VALID_MAP_VIEW_ERROR);

	// "Local tile pos for conversion not relative to the map view"
	//	Independant x over range
	testPositionRangeError(assert, mapController.showMapPosition, mapController, mapController.mapModel.mapSizeX, 0, POS_NOT_VALID_MAP_VIEW_ERROR);
	//	Independant y over range
	testPositionRangeError(assert, mapController.showMapPosition, mapController, 0, mapController.mapModel.mapSizeY, POS_NOT_VALID_MAP_VIEW_ERROR);
	//	X and Y over range
	testPositionRangeError(assert, mapController.showMapPosition, mapController, mapController.mapModel.mapSizeX, mapController.mapModel.mapSizeY, POS_NOT_VALID_MAP_VIEW_ERROR);
}
);
