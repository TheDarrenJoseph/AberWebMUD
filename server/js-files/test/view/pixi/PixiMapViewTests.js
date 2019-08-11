import PIXI from 'libs/pixi.min.js';

import MapModel from 'src/model/pixi/map/MapModel.js';
import MapCharacter from 'src/model/pixi/map/MapCharacter.js';
import Player from 'src/model/Player.js';

import { PixiMapView,  } from 'src/view/pixi/PixiMapView.js';
import { DEFAULT_TILE_SIZE } from 'src/model/pixi/map/MapModel.js';
import { DEFAULT_TILETYPE } from 'src/model/pixi/map/MapTile.js';
import { PageController } from 'src/controller/page/PageController.js';
import { PixiController, ASSET_PATHS } from 'src/controller/pixi/PixiController.js';

let TEST_TAG = '|PIXI-MAP-VIEW|';

let pageController = new PageController(() => {}, undefined, undefined, undefined, undefined);

let pixiController = new PixiController(undefined, pageController);
let renderer = pixiController.pixiView.getRenderer();
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

let MAX_TIMEOUT = 5000;

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
	mapModel = new MapModel(TEST_TILECOUNT);
	pixiMapView = new PixiMapView(mapModel, renderer, TEST_WINDOW_SIZE, DEFAULT_TILE_SIZE, ASSET_PATHS);
}

// Hookup before each test setup / assertion
QUnit.module('PixiMapViewTests', { before: beforeAll, beforeEach: beforeEachTest })

// Ensure the pixi map view data builds as we expect it to
QUnit.test(TEST_TAG + 'new PixiMapView', function (assert) {
	// PixiMapView construction can be a little slow
	// Give us 15s to sort our shit out
	assert.timeout(MAX_TIMEOUT);

	let testPixiController = new PixiController(undefined, pageController);
	assert.notEqual(undefined, testPixiController.pixiView, 'Make sure the PixiController PixiView is not undefined.');

	let testPixiMapView = new PixiMapView(mapModel, testPixiController.pixiView.getRenderer(), TEST_WINDOW_SIZE, DEFAULT_TILE_SIZE, ASSET_PATHS);
	var initDone = assert.async(1);

	// Let it block us while it sets up
	//testPixiMapView.initialise().then( () => {
		assert.ok(testPixiMapView.mapModel instanceof MapModel, 'Check the constructor sets it\'s Map model the one provided.');

		assert.ok(testPixiMapView.renderer instanceof PIXI.WebGLRenderer ||
		testPixiMapView.renderer instanceof PIXI.CanvasRenderer, 'Check PixiMapView renderer is set.');

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
		assert.equal(testPixiMapView.highestViewPosition, 11, 'Check highest mapview position is calculated correctly.');
		assert.deepEqual(testPixiMapView.mapViewMinPosition, [-9, -9], 'Check mapview min position is calculated correctly.');
		assert.deepEqual(testPixiMapView.mapViewMaxPosition, [11, 11], 'Check mapview max position is calculated correctly.');

		// Iter
		// 2D Array of TEST_TILECOUNT size
		let mapTileArray = mapModel.getTiles();
		assert.ok(mapTileArray instanceof Array, 'Check mapTileArray is actually an array');
		assert.equal(mapTileArray.length, TEST_TILECOUNT, 'Check mapTileArray 1d size.');

		let firstTile = mapTileArray[0][0];
		assert.equal(firstTile.getTileType(), DEFAULT_TILETYPE, 'Ensure the first tile has the default tile type number.');

	// Check Pixi JS Container objects
		// Top level container for all children
		let parentContainer = testPixiMapView.parentContainer;
		assert.ok(parentContainer instanceof PIXI.Container, 'Ensure the pixiMapView parent container is initialised.');
		// Check our child containers are added and of the correct type
		assert.ok(parentContainer.getChildByName('mapContainer') instanceof PIXI.particles.ParticleContainer, 'Check ParticleContainer mapContainer exists under parentContainer.');
		assert.ok(parentContainer.getChildByName('characterContainer') instanceof PIXI.particles.ParticleContainer, 'Check ParticleContainer characterContainer exists under parentContainer.');

		initDone();
	//}).catch(rejection => {
	//	assert.ok(false, 'Initialisation Promise rejected with: ' + JSON.stringify(rejection));
	///	console.log('Iinitialisation promise rejected with: ');
	//	console.log(rejection);
	//});

}
);

QUnit.test(
TEST_TAG + 'newPlayerOnMap', function (assert) {
	assert.timeout(MAX_TIMEOUT);

	let characterAtlasPath = null;
	let username = 'timmy'
	let characterName = 'TIMMY TEST';
	let gridX = 2;
	let gridY = 2;
	// Wait for the map character to build and return

	var mapPlayerPromise = pixiMapView.newPlayerOnMap(username, characterName, gridX, gridY);

	var mapPlayerDone = assert.async(1);
	mapPlayerPromise.then( (player) => {
		assert.ok(player instanceof Player, 'Check we created a Player for this position.');
		assert.ok(player.getCharacter() instanceof MapCharacter, 'Check the Player has a MapCharacter');
		mapPlayerDone();
	}, rejection => {
		assert.ok(false, 'new Player on Map Promise rejected with: ' + rejection);
		throw(rejection);
	});


}
);

// drawMapTiles
QUnit.test(
TEST_TAG + 'drawMapTiles', function (assert) {
	assert.timeout(MAX_TIMEOUT);

	let asyncDrawDone = assert.async(1);
	// Wait to intialise the full capabilities
	//pixiMapView.initialise().then( () => {
		// Returns a promise for when all the sprites are updated
		let mapDrawPromise = pixiMapView.drawMapTiles();

		mapDrawPromise.then(() => {

			let mapTileArray = mapModel.getTiles();
			assert.ok(mapTileArray instanceof Array, 'Check mapTileArray is actually an array');
			assert.equal(mapTileArray.length, TEST_TILECOUNT, 'Check mapTileArray 1d size.');

			let firstTile = mapTileArray[0][0];
			assert.equal(firstTile.getTileType(), DEFAULT_TILETYPE, 'Ensure the first tile has the default tile type number.');
			let firstTileSprite = firstTile.getSprite();
			assert.ok(firstTileSprite instanceof PIXI.Sprite, 'Ensure the first tile has a valid PIXI Sprite assigned.');
			assert.deepEqual([firstTileSprite.position.x, firstTileSprite.position.y], [0,0] , 'Ensure the first tile has the correct PIXI Point position.');
			assert.equal(firstTileSprite.texture.textureCacheIds[0], 'grass-plain', 'Ensure the first sprite has the correct sprite texture cache name');
			assert.equal(firstTileSprite.height, DEFAULT_TILE_SIZE, 'Ensure the first sprite has the correct height');
			assert.equal(firstTileSprite.width, DEFAULT_TILE_SIZE, 'Ensure the first sprite has the correct width');

			let lastTile = mapTileArray[TEST_TILECOUNT-1][TEST_TILECOUNT-1];
			assert.equal(lastTile.getTileType(), DEFAULT_TILETYPE, 'Ensure the last tile has the default tile type number.');
			let lastTileSprite = lastTile.getSprite();
			assert.ok(lastTileSprite instanceof PIXI.Sprite, 'Ensure the last tile has a valid PIXI Sprite assigned.');
			assert.equal(lastTileSprite.texture.textureCacheIds[0], 'grass-plain', 'Ensure the last sprite has the correct sprite texture cache name');
			assert.equal(lastTileSprite.height, DEFAULT_TILE_SIZE, 'Ensure the last sprite has the correct height');
			assert.equal(lastTileSprite.width, DEFAULT_TILE_SIZE, 'Ensure the last sprite has the correct width');

			let maxmimumTilePosition = (TEST_TILECOUNT-1) * DEFAULT_TILE_SIZE;
			assert.deepEqual([lastTileSprite.position.x, lastTileSprite.position.y], [maxmimumTilePosition, maxmimumTilePosition] , 'Ensure the last tile has the correct PIXI Point position.');

			assert.ok(pixiMapView.mapContainer instanceof PIXI.Container, 'Check the map Container is a PIXI.Container');
			assert.ok(pixiMapView.mapContainer.children instanceof Array, 'Check the map Container has a children array');

			let totalTileArea = TEST_TILECOUNT * TEST_TILECOUNT;
			assert.equal(pixiMapView.mapContainer.children.length, totalTileArea, 'Check the map Container has enough children for each tile');
			asyncDrawDone();
		}).catch(rejection => {
			assert.ok(false, 'Map drawing Promise rejected with: ' + rejection);
		});
	//});
	assert.expect(17);
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
