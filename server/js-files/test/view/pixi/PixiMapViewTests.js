import Map from 'src/model/Map.js';
import { DEFAULT_TILE_SIZE } from 'src/view/pixi/PixiMapView.js';
import PixiMapView from 'src/view/pixi/PixiMapView.js';

import { PixiController } from 'src/controller/pixi/PixiController.js';

let renderer = PixiController.pixiView.getRenderer();
let TEST_TAG = '|PIXI-MAP-VIEW|';
// Enough pixels for 20 tiles
let testTileCount = 20;
let testWindowSize = DEFAULT_TILE_SIZE * testTileCount;
let mapModel;
let tileMappings = null;
let atlasPath = null;
let pixiMapView;

// Setup / assertions before any test runs
function beforeAll (assert) {
	// DO SOME STUFF
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Re-initialise our classes
	mapModel = new Map();
	pixiMapView = new PixiMapView(mapModel, tileMappings, renderer, atlasPath, testWindowSize);
}

// Hookup before each test setup / assertion
QUnit.module('pixiMapViewTests', { before: beforeAll, beforeEach: beforeEachTest })

// Ensure the pixi map view data builds as we expect it to
QUnit.test(
TEST_TAG + 'new-pixi-map-view', function (assert) {
	let testPixiMapView = new PixiMapView(new Map(20), null, PixiController.pixiView.getRenderer(), null, DEFAULT_TILE_SIZE * 20);
	assert.deepEqual(testPixiMapView.tileCount, 20, 'Check mapview tilecount');
	assert.deepEqual(testPixiMapView.zeroIndexedTileCount, 19, 'Check mapview zero-indexed tilecount.');
	assert.deepEqual(testPixiMapView.halfZeroIndexedTileCountFloored, 9, 'Check mapview half-tilecount floored.');
	assert.deepEqual(testPixiMapView.halfZeroIndexedTileCountCeiled, 10, 'Check mapview half-tilecount ceiled.');
}
);

// Checking the lowest local position that's in the map mapModel
// Our view can over/underhang the actual map tiles
// This helps to find the starting range of the real map tiles for validation
QUnit.test(
	TEST_TAG + 'lowest-map-position', function (assert) {

		assert.equal(pixiMapView.tileCount, testTileCount, 'Check that the tilecount has been calculated as: ' + testTileCount);

		// We need to be sure of where the end of the map is
		// Hardcoding 20 to be 100% sure of the math here
		assert.deepEqual(mapModel.getMapSizes(), [20, 20], 'Check that our test tilecount matches the view tilecount.');

		// 1. Check lowest pos with the map starting at pos 0,0
		let mapViewStart = pixiMapView.getMapViewStartPosition();
		assert.deepEqual(mapViewStart, [0, 0], 'Checking default lowest possible in-map mapview pos.');

		let lowestPos = pixiMapView.getLowestInMapPosition();
		assert.deepEqual(lowestPos, [0, 0], 'Checking default lowest possible in-map mapview pos.');

		// 2.1 Set x view pos half underhanging (Floored)
		// Zero index this
		let xMinusPos = -9;
		pixiMapView.setMapViewPosition(xMinusPos, 0);
		lowestPos = pixiMapView.getLowestInMapPosition();
		assert.deepEqual(lowestPos, [9, 0], '(Underhanging X Floored) Checking lowest possible in-map mapview pos.');

		// 2.2 Set x view pos half underhanging (Ceiled)
		// Zero index this
		xMinusPos = -10;
		pixiMapView.setMapViewPosition(xMinusPos, 0);
		lowestPos = pixiMapView.getLowestInMapPosition();
		assert.deepEqual(lowestPos, [10, 0], '(Underhanging X Ceiled) Checking lowest possible in-map mapview pos.');

		// 3.1 Set x view pos half overhanging (Floored)
		pixiMapView.setMapViewPosition(9, 0);
		lowestPos = pixiMapView.getLowestInMapPosition();
		assert.deepEqual(lowestPos, [0, 0], '(Overhanging X Floored) Checking default possible in-map mapview pos.');

		// 3.2 Set x view pos half overhanging (Ceiled)
		pixiMapView.setMapViewPosition(10, 0);
		lowestPos = pixiMapView.getLowestInMapPosition();
		assert.deepEqual(lowestPos, [0, 0], '(Overhanging X Ceiled) Checking default possible in-map mapview pos.');

		// 4.1 Set y view pos half underhanging (Floored)
		pixiMapView.setMapViewPosition(0, -9);
		lowestPos = pixiMapView.getLowestInMapPosition();
		assert.deepEqual(lowestPos, [0, 9], '(Underhanging Y Floored) Checking lowest possible in-map mapview pos.');

		// 4.2 Set y view pos half underhanging (Ceiled)
		// Zero index this
		pixiMapView.setMapViewPosition(0, -10);
		lowestPos = pixiMapView.getLowestInMapPosition();
		assert.deepEqual(lowestPos, [0, 10], '(Underhanging Y Ceiled) Checking lowest possible in-map mapview pos.');

		// 5.1 Set y view pos half overhanging (Floored)
		pixiMapView.setMapViewPosition(0, 9);
		lowestPos = pixiMapView.getLowestInMapPosition();
		assert.deepEqual(lowestPos, [0, 0], '(Overhanging Y Floored) Checking lowest possible in-map mapview pos.');

		// 5.2 Set y view pos half overhanging (Ceiled)
		pixiMapView.setMapViewPosition(0, 10);
		lowestPos = pixiMapView.getLowestInMapPosition();
		assert.deepEqual(lowestPos, [0, 0], '(Overhanging Y Ceiled) Checking lowest possible in-map mapview pos.');
	}
	);

QUnit.test(
	TEST_TAG + 'highest-map-position', function (assert) {
		assert.equal(pixiMapView.tileCount, 20, 'Check that the tilecount has been calculated as: ' + testTileCount);
		// We need to be sure of where the end of the map is
		// Hardcoding 20 to be 100% sure of the math here
		assert.deepEqual(mapModel.getMapSizes(), [20, 20], 'Check that our test tilecount matches the view tilecount.');

		// 1. Check lowest pos with the map starting at pos 0,0
		// Should be the end of the map view
		let mapViewStart = pixiMapView.getMapViewStartPosition();
		assert.deepEqual(mapViewStart, [0, 0], 'Checking default highest possible in-map mapview pos.');
		let highestPos = pixiMapView.getHighestInMapPosition();
		assert.deepEqual(highestPos, [19, 19], 'Checking default highest possible in-map mapview pos.');

		// 2.1 Set x view pos half underhanging (Floored)
		// Expect highest pos to be the end of the map view
		pixiMapView.setMapViewPosition(-9, 0);
		highestPos = pixiMapView.getHighestInMapPosition();
		assert.deepEqual(highestPos, [19, 19], '(Underhanging X Floored) Checking highest possible in-map mapview pos.');

		// 2.2 Set x view pos half underhanging (Ceiled)
		// Expect highest pos to be the end of the map
		pixiMapView.setMapViewPosition(-10, 0);
		highestPos = pixiMapView.getHighestInMapPosition();
		assert.deepEqual(highestPos, [19, 19], '(Underhanging X Ceiled) Checking highest possible in-map mapview pos.');

		// 3.1 Set x view pos half overhanging (Floored)
		pixiMapView.setMapViewPosition(9, 0);
		highestPos = pixiMapView.getHighestInMapPosition();
		// Tile count 20 - starting y of 9 = 11
		assert.deepEqual(highestPos, [10, 19], '(Overhanging X Floored) Checking highest possible in-map mapview pos.');

		// 3.2 Set x view pos half overhanging (Ceiled)
		pixiMapView.setMapViewPosition(9, 0);
		highestPos = pixiMapView.getHighestInMapPosition();
		assert.deepEqual(highestPos, [10, 19], '(Overhanging X Ceiled) Checking highest possible in-map mapview pos.');

		// 4.1 Set y view pos half underhanging (Floored)
		pixiMapView.setMapViewPosition(0, -9);
		highestPos = pixiMapView.getHighestInMapPosition();
		assert.deepEqual(highestPos, [19, 19], '(Underhanging Y Floored) Checking highest possible in-map mapview pos.');

		// 4.2 Set y view pos half underhanging (Ceiled)
		pixiMapView.setMapViewPosition(0, -10);
		highestPos = pixiMapView.getHighestInMapPosition();
		assert.deepEqual(highestPos, [19, 19], '(Underhanging Y Ceiled) Checking highest possible in-map mapview pos.');

		// 5.1 Set y view pos half overhanging (Floored)
		pixiMapView.setMapViewPosition(0, 9);
		highestPos = pixiMapView.getHighestInMapPosition();
		// Tile count 20 - starting y of 9 = 11
		assert.deepEqual(highestPos, [19, 10], '(Overhanging Y Floored) Checking highest possible in-map mapview pos.');

		// 5.1 Set y view pos half overhanging (Ceiled)
		// Position 10 (11) is inclusive and will leave 9 tiles afterwards
		// So max is 10 tiles - 1 to zero index == 9
		pixiMapView.setMapViewPosition(0, 10);
		highestPos = pixiMapView.getHighestInMapPosition();
		assert.deepEqual(highestPos, [19, 9], '(Overhanging Y Ceiled) Checking highest possible in-map mapview pos.');
	}
	);
