import { MapModel, DEFAULT_MAP_SIZE_XY, DEFAULT_TILE_SIZE } from 'src/model/pixi/map/MapModel.js';

const TEST_TAG = '|MAP-MODEL|';

let mapModel = null;

// Setup / assertions before any test runs
function beforeAll (assert) {
	mapModel = new MapModel(DEFAULT_MAP_SIZE_XY);
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// DO SOME STUFF
}

// Hookup before each test setup / assertion
QUnit.module('MapModelTests', { before: beforeAll, beforeEach: beforeEachTest });

//	Check that a position is valid for the global map
QUnit.test(TEST_TAG + 'in-map-valid', function (assert) {
	//	Lowest possible co-ords
	assert.ok(mapModel.isPositionInMap(0, 0), 'Check global map position 0, 0 is valid.');
	//	Highest possible co-ords
	let mapSizes = mapModel.getMapSizes();
	// -1 for zero indexing
	let maxMapX = mapSizes[0] - 1;
	let maxMapY = mapSizes[1] - 1;

	assert.ok(mapModel.isPositionInMap(maxMapX, 0), 'Check global map x maximum position ' + maxMapX + ',' + 0);
	assert.ok(mapModel.isPositionInMap(0, maxMapY), 'Check global map y maximum position ' + 0 + ',' + maxMapY);

	assert.ok(mapModel.isPositionInMap(maxMapX, maxMapY), 'Check global map maximum position (' + maxMapX + ',' + maxMapY + ')');
}
);

QUnit.test(TEST_TAG + 'in-map-invalid', function (assert) {
	// Under lowest possible co-ords (x)
	assert.notOk(mapModel.isPositionInMap(-1, 0), 'Check invalid global x position -1, 0');
	// Under lowest possible co-ords (y)
	assert.notOk(mapModel.isPositionInMap(0, -1), 'Check invalid global y position  0, -1 ');

	// Max valid positions
	let mapSizes = mapModel.getMapSizes();
	let mapXOneIndexed = mapSizes[0];
	let mapYOneIndexed = mapSizes[1];

	assert.notOk(mapModel.isPositionInMap(mapXOneIndexed, 0), 'Check maximum global map x pos +1 : ' + mapXOneIndexed); //  Over highest possible co-ords (x)
	//  Over highest possible co-ords (y)
	assert.notOk(mapModel.isPositionInMap(0, mapYOneIndexed), 'Check maximum global map y pos  +1 : ' + mapYOneIndexed);
}
);