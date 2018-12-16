import * as PIXI from 'libs/pixi.min.js';

import Map from 'src/model/Map.js';
import { PixiMapView, DEFAULT_TILE_SIZE } from 'src/view/pixi/PixiMapView.js';

import { PixiController, ASSET_PATHS } from 'src/controller/pixi/PixiController.js';

let renderer = PixiController.pixiView.getRenderer();
let TEST_TAG = '|PIXI-MAP-VIEW|';
// Enough pixels for 20 tiles
const TEST_TILECOUNT = 20;
const TEST_WINDOW_SIZE = DEFAULT_TILE_SIZE * TEST_TILECOUNT;
// Start / end positions for our 20 tile view
const MAPVIEW_START_POS = [0, 0];
const MAPVIEW_END_POS = [19, 19];
let mapModel;
let tileMappings = null;
let atlasPath = null;
let pixiMapView = null;

// Setup / assertions before any test runs
function beforeAll (assert) {
	assert.ok(renderer instanceof PIXI.WebGLRenderer ||
					renderer instanceof PIXI.CanvasRenderer, 'Check test Pixi renderer is instanciated.');

	// Assert things that really should be true
	assert.equal(DEFAULT_TILE_SIZE, 40, 'Check default tile size (pixels) is as expected.')
	assert.equal(TEST_WINDOW_SIZE, 800, 'Check test window size (pixels) is as expected.')
	// DO SOME STUFF
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Re-initialise our classes
	mapModel = new Map();
	pixiMapView = new PixiMapView(mapModel, renderer, TEST_WINDOW_SIZE, ASSET_PATHS);
}

// Hookup before each test setup / assertion
QUnit.module('PixiMapViewTests', { before: beforeAll, beforeEach: beforeEachTest })

// Ensure the pixi map view data builds as we expect it to
QUnit.test(
TEST_TAG + 'new PixiMapView', async function (assert) {
	// PixiMapView construction can be a little slow
	// Give us 5s to sort our shit out
	assert.timeout(10000);
	
	let testPixiMapView = new PixiMapView(new Map(TEST_TILECOUNT), PixiController.pixiView.getRenderer(), DEFAULT_TILE_SIZE * 20, ASSET_PATHS);
	
	// Let it block us while it sets up
	await testPixiMapView.initialise();
	
	assert.ok(pixiMapView.mapModel instanceof Map, 'Check the constructor sets it\'s Map model the one provided.');

	assert.ok(pixiMapView.renderer instanceof PIXI.WebGLRenderer ||
					pixiMapView.renderer instanceof PIXI.CanvasRenderer, 'Check PixiMapView renderer is set.');

	// tileCount is the number of tiles we can fit into this square area
	assert.equal(testPixiMapView.tileCount, TEST_TILECOUNT, 'Check mapview tilecount');
	assert.equal(testPixiMapView.zeroIndexedTileCount, 19, 'Check mapview zero-indexed tilecount.');

	// Global position where the map view begins
	assert.deepEqual([testPixiMapView.mapViewStartX, testPixiMapView.mapViewStartY], MAPVIEW_START_POS, 'Check mapview start position.');
	assert.deepEqual([testPixiMapView.mapViewEndX, testPixiMapView.mapViewEndX], MAPVIEW_END_POS, 'Check mapview end position.');

	// Check the logic and values behave as expected
	// -1 to zero-index, then divide and floor/ceil appropriately
	assert.equal(Math.floor((TEST_TILECOUNT - 1) / 2), 9, 'Check calculation of halfZeroIndexedTileCountFloored');
	assert.equal(Math.ceil((TEST_TILECOUNT - 1) / 2), 10, 'Check calculation of halfZeroIndexedTileCountCeiled');
	assert.equal(testPixiMapView.halfZeroIndexedTileCountFloored, 9, 'Check mapview half-tilecount floored.');
	assert.equal(testPixiMapView.halfZeroIndexedTileCountCeiled, 10, 'Check mapview half-tilecount ceiled.');

	// Map Window Size based on fittable tiles
	assert.equal(testPixiMapView.mapWindowSize, TEST_WINDOW_SIZE, 'Check mapWindowSize is set.');
	assert.equal(testPixiMapView.halfMapWindowSize, TEST_WINDOW_SIZE / 2, 'Check halfMapWindowSize is calculated correctly.');

	// Lowest valid map start position is minus half of the map
	// This allows an edge of the map to be in the middle of the screen
	assert.equal(testPixiMapView.lowestViewPosition, -9, 'Check lowest mapview position is calculated correctly.');
	assert.equal(testPixiMapView.highestViewPosition, 9, 'Check highest mapview position is calculated correctly.');
	assert.deepEqual(testPixiMapView.mapViewMinPosition, [-9, -9], 'Check mapview min position is calculated correctly.');
	assert.deepEqual(testPixiMapView.mapViewMaxPosition, [9, 9], 'Check mapview max position is calculated correctly.');
	
	// Iter
	// 2D Array of TEST_TILECOUNT size
	let tileSpriteArray = testPixiMapView.tileSpriteArray;
	assert.ok(tileSpriteArray instanceof Array, 'Check tileSpriteArray is actually an array');
	assert.equal(tileSpriteArray.length, TEST_TILECOUNT, 'Check tileSpriteArray 1d size.');
	

	// Check the sub-arrays for 2D size validation
	let depthCount = 0
	let spritesValid = 0;
	let expectedValid = TEST_TILECOUNT * TEST_TILECOUNT;
	for (var i = 0; (i < TEST_TILECOUNT); i++) {
		if (tileSpriteArray[i].length === TEST_TILECOUNT) {
			depthCount++;
		}
		for (var j = 0; (j < TEST_TILECOUNT); j++) {
			let sprite = tileSpriteArray[i][j];
			// Increment a count 
			// instead of printing tons of assertion messages
			if (sprite !== null && sprite !== undefined && sprite instanceof PIXI.Sprite) {
				spritesValid++;
			}
		}
	}
	assert.equal(depthCount, TEST_TILECOUNT, 'Check tileSpriteArray 1d depth is valid.');
	assert.equal(spritesValid, expectedValid, 'Check tileSpriteArray is initialised fully');
		
	// 2D Array of TEST_TILECOUNT size
	
	let mapCharacterArray = testPixiMapView.mapCharacterArray;
	assert.ok(mapCharacterArray instanceof Array, 'Check mapCharacterArray is actually an array');
	assert.equal(mapCharacterArray.length, TEST_TILECOUNT, 'Check tileSpriteArray 1d size.');
	// Check the sub-arrays for 2D size validation
	depthCount = 0;
	for (i = 0; (i < TEST_TILECOUNT); i++) {
		if (mapCharacterArray[i].length === TEST_TILECOUNT) {
			depthCount++;
		}
	}
	assert.equal(depthCount, TEST_TILECOUNT, 'Check mapCharacterArray 1d depth is valid.');
	
	// Check Pixi JS Container objects
	let parentContainer = pixiMapView.parentContainer;
	console.log('Parent Container..');
	console.log(parentContainer);
	// Top level container for all children
	assert.ok(parentContainer instanceof PIXI.Container, 'Ensure the pixiMapView parent container is initialised.');

	// Check our child containers are added and of the correct type
	assert.ok(parentContainer.getChildByName('mapContainer') instanceof PIXI.particles.ParticleContainer, 'Check ParticleContainer mapContainer exists under parentContainer.');
	assert.ok(parentContainer.getChildByName('characterContainer') instanceof PIXI.particles.ParticleContainer, 'Check ParticleContainer characterContainer exists under parentContainer.');
}
);


QUnit.test(
TEST_TAG + 'createMapCharacterArray', function assertMapCharacterArray (assert, mapCharacterArray = pixiMapView.createMapCharacterArray(TEST_TILECOUNT)) {
	assert.ok(mapCharacterArray instanceof Array, 'Check mapCharacterArray is actually an array');
	assert.equal(mapCharacterArray.length, TEST_TILECOUNT, 'Check tileSpriteArray 1d size.');

	// Check the sub-arrays for 2D size validation
	for (let i = 0; (i < TEST_TILECOUNT); i++) {
		assert.equal(mapCharacterArray[i].length, TEST_TILECOUNT);
	}
}
);


QUnit.test(
TEST_TAG + 'newCharacterOnMap', function (assert) {
	let characterAtlasPath = null;
	let characterName = 'TIMMY TEST';
	let gridX = 2;
	let gridY = 2;
	pixiMapView.newCharacterOnMap(characterAtlasPath, characterName, gridX, gridY);
	assert.ok(false, 'TODO');
}
);

// drawMapToGrid
QUnit.test(
TEST_TAG + 'drawMapToGrid', function (assert) {
	pixiMapView.drawMapToGrid(0, 0);
	assert.ok(false, 'TODO');
}
);

//	Testing relative co-ords (tile view co-ords) that are 0 indexed
QUnit.test(TEST_TAG + 'relative-to-view-valid', function (assert) {
	//	Lowest possible
	assert.ok(pixiMapView.isPositionRelativeToView(0, 0), 'Checking validity of map view position 0,0');
	//	Highest possible (-1 for 0 indexing)
	let largestPos = pixiMapView.tileCount - 1;
	assert.ok(pixiMapView.isPositionRelativeToView(largestPos, largestPos), 'Checking validity of largest map view pos ' + largestPos + ',' + largestPos);
}
);

QUnit.test(TEST_TAG + 'relative-to-view-invalid', function (assert) {
	let justOverTileCount = pixiMapView.tileCount + 1;

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

QUnit.test(TEST_TAG + 'in-mapview-valid', function (assert) {

	// Wherever our map view is starting (top-left corner)
	let mapViewStartPos = pixiMapView.getMapViewStartPosition();
	let mapStartX = mapViewStartPos[0];
	let mapStartY = mapViewStartPos[1];

	//  Lowest range posible
	assert.ok(pixiMapView.isGlobalPositionInMapView(mapStartX, mapStartY), 'Check lowest valid map view range: ' + mapStartX + ',' + mapStartY);

	// Calculate the end of our map-view (bottom-right)
	let tileCountIncrement = pixiMapView.tileCount - 1;
	let topRangeX = mapStartX + tileCountIncrement;
	let topRangeY = mapStartX + tileCountIncrement;

	// Highest range possible
	assert.ok(
		pixiMapView.isGlobalPositionInMapView(topRangeX,
			topRangeY), 'Check highest valid range in-map-view: ' + topRangeX + ',' + topRangeY);
}
);

// The map view can move around a larger map, check invalid global positions
QUnit.test(TEST_TAG + 'in-mapview-invalid', function (assert) {
	let mapViewStartPos = pixiMapView.getMapViewStartPosition();
	let mapViewStartX = mapViewStartPos[0];
	let mapViewStartY = mapViewStartPos[1];

	// Correct starting positions - 1
	let xBoundUnder = mapViewStartX - 1;
	let yBoundUnder = mapViewStartY - 1;

	// Correct ending positions + 1
	let xBoundOver = mapViewStartX + pixiMapView.tileCount + 1;
	let yBoundOver = mapViewStartY + pixiMapView.tileCount + 1;

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

//	TODO Maybe test actual Pixi rendering?
//	renderAll
//	renderMapContainer
//	renderCharacterContainer

// Checking the lowest local position that's in the map mapModel
// Our view can over/underhang the actual map tiles
// This helps to find the starting range of the real map tiles for validation
QUnit.test(TEST_TAG + 'getLowestInMapPosition', function (assert) {
	assert.equal(pixiMapView.tileCount, TEST_TILECOUNT, 'Check that the tilecount has been calculated as: ' + TEST_TILECOUNT);

	// We need to be sure of where the end of the map is
	// Hardcoding 20 to be 100% sure of the math here
	assert.deepEqual(mapModel.getMapSizes(), [20, 20], 'Check that our test tilecount matches the view tilecount.');

	// 1. Check lowest pos with the map starting at pos 0,0
	let mapViewStart = pixiMapView.getMapViewStartPosition();
	assert.deepEqual(mapViewStart, MAPVIEW_START_POS, 'Checking default lowest possible in-map mapview pos.');

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

QUnit.test(TEST_TAG + 'getHighestInMapPosition', function (assert) {
	assert.equal(pixiMapView.tileCount, 20, 'Check that the tilecount has been calculated as: ' + TEST_TILECOUNT);
	// We need to be sure of where the end of the map is
	// Hardcoding 20 to be 100% sure of the math here
	assert.deepEqual(mapModel.getMapSizes(), [20, 20], 'Check that our test tilecount matches the view tilecount.');

	// 1. Check lowest pos with the map starting at pos 0,0
	// Should be the end of the map view
	let mapViewStart = pixiMapView.getMapViewStartPosition();
	assert.deepEqual(mapViewStart, MAPVIEW_START_POS, 'Checking default highest possible in-map mapview pos.');
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