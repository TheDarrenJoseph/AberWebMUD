import { PixiController } from 'src/controller/pixi/PixiController.js';
import { CONSOLE_BUTTON_NAME, INVENTORY_BUTTON_NAME, STATS_BUTTON_NAME } from 'src/view/pixi/PixiView.js';
import { DEFAULT_TILE_SIZE } from 'src/model/pixi/map/MapModel.js';
import { PixiStatBar } from '../../../src/view/pixi/PixiStatBar'

let TEST_TAG = '|PIXI CONTROLLER|';

const MAX_TIMEOUT = 10000;
const TEST_WINDOW_SIZE = 500;

let pixiController;
let TEST_WINDOW;
let TEST_DOCUMENT;
let canvasView;

// Setup / assertions before any test runs
async function beforeAll (assert) {
	TEST_WINDOW = window.open('', TEST_TAG, "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes")
	TEST_DOCUMENT = TEST_WINDOW.document;
}

// Setup / assertions before each test
async function beforeEachTest (assert) {
	// Set a max timeout as we're doing async stuff here
	assert.timeout(MAX_TIMEOUT);

	// Make sure we have a fresh controller every time
	// To prevent knock-on state changes
	pixiController = new PixiController(TEST_WINDOW_SIZE);
	assert.ok(pixiController instanceof PixiController, 'Check controller instance is instanciated.');

	assert.notEqual(undefined, pixiController.pixiView, 'Make sure the PixiController PixiView is not undefined.');

	canvasView = await pixiController.enableUI();
	TEST_DOCUMENT.body.appendChild(canvasView);

	// Assert generic things
	assert.ok(canvasView instanceof HTMLCanvasElement, 'Check the Canvas is setup');

	assert.ok(TEST_WINDOW.innerWidth > 100, 'Check the test window width is sane');
	assert.ok(TEST_WINDOW.innerHeight > 100, 'Check the test window height is sane');
	assert.equal(canvasView.width, TEST_WINDOW_SIZE);
	assert.equal(canvasView.height, TEST_WINDOW_SIZE);

}

function afterAll () {
	TEST_WINDOW.close();
}

function afterEachTest () {
	// Ensure we don't leave the used HTML Canvas on the test window
	if (TEST_DOCUMENT !== undefined && canvasView !== undefined) {
		TEST_DOCUMENT.body.removeChild(canvasView);
	}
}

// Hookup before each test setup / assertion
QUnit.module('PixiControllerTests', { before: beforeAll, beforeEach: beforeEachTest, after: afterAll, afterEach : afterEachTest });

/**
 * Given that the PixiController is setup
 * When the UI is enabled
 * Then there should be contextButton Sprites in the controls container
 */
QUnit.test(TEST_TAG + 'enableUI_contextButtons', function (assert) {
	//There should be a console Button
	let controlsContainer = pixiController.pixiView.controlsContainer;
	assert.ok(controlsContainer instanceof PIXI.Container, 'Check the controls container is a PIXI.Container');
	assert.ok(controlsContainer.visible, 'Check the controls container is visible.');

	// 1 tile distance from the botton of the window
	let singleTileOffsetPos = TEST_WINDOW_SIZE - DEFAULT_TILE_SIZE;

	let inventoryButton = controlsContainer.getChildByName(INVENTORY_BUTTON_NAME);
	assert.ok(inventoryButton instanceof PIXI.Sprite, 'Check the inventory button is a Pixi Sprite');
	assert.ok(inventoryButton.visible, 'Check the chat inventory button is displayed/visible.');
	let expectedInventoryButtonPos = new PIXI.Point(TEST_WINDOW_SIZE - (DEFAULT_TILE_SIZE * 2), singleTileOffsetPos);
	assert.ok(expectedInventoryButtonPos.equals(inventoryButton.position));

	let statsButton = controlsContainer.getChildByName(STATS_BUTTON_NAME);
	assert.ok(statsButton instanceof PIXI.Sprite, 'Check the stats button is a Pixi Sprite');
	assert.ok(statsButton.visible, 'Check the chat stats button is displayed/visible.');
	let expectedStatsButtonPos = new PIXI.Point(TEST_WINDOW_SIZE - (DEFAULT_TILE_SIZE * 4), singleTileOffsetPos);
	assert.ok(expectedStatsButtonPos.equals(statsButton.position));
});

/**
 * Given that the PixiController is setup
 * When the UI is enabled
 * Then there should be a health bar in the top-right of screen
 */
QUnit.test(TEST_TAG + 'enableUI_statBars', function (assert) {
	// We should have 1 stat bar which is the health bar
	let statBars = pixiController.pixiView.statBars;
	assert.ok(statBars.length == 1, 'Check there is 1 item in the stat bars array');
	assert.ok(statBars[0] instanceof PixiStatBar);

	// And it's visible
	let healthBar = statBars[0];
	assert.ok(healthBar.isVisible(), 'Check the health bar is visible');
});