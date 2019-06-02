import PIXI from 'libs/pixi.min.js';

import { PixiView } from 'src/view/pixi/PixiView.js';
import { ASSET_PATHS } from 'src/controller/pixi/PixiController.js'
import { CONSOLE_BUTTON_NAME, INVENTORY_BUTTON_NAME, STATS_BUTTON_NAME } from 'src/view/pixi/PixiView.js';
import { PixiStatBar } from 'src/view/pixi/PixiStatBar.js'

let TEST_TAG = '|PIXI-VIEW|';
let TEST_WINDOW;
let TEST_DOCUMENT;

const TEST_TILECOUNT = 20;
const TEST_TILESIZE = 40;
const TEST_WINDOW_SIZE = TEST_TILESIZE * TEST_TILECOUNT;

let pixiView;
let renderer
let canvasView;

// Setup / assertions before any test runs
function beforeAll (assert) {
	TEST_WINDOW = window.open('', TEST_TAG, "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes")
	TEST_DOCUMENT = TEST_WINDOW.document;
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	pixiView = new PixiView(TEST_WINDOW_SIZE, TEST_TILESIZE, ASSET_PATHS);
	renderer = pixiView.getRenderer();
	canvasView = renderer.view;
	TEST_DOCUMENT.body.appendChild(renderer.view);

	assert.ok(renderer instanceof PIXI.WebGLRenderer ||
	renderer instanceof PIXI.CanvasRenderer, 'Check test Pixi renderer is instanciated.');

	// Assert things that really should be true
	assert.equal(TEST_WINDOW_SIZE, 800, 'Check test window size (pixels) is as expected.')
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
QUnit.module('PixiViewTests', { before: beforeAll, beforeEach: beforeEachTest, after: afterAll, afterEach : afterEachTest  });

/**
 * Given that we've created a new PixiView
 * When we setup the UI
 * Then there should be a console button that's setup but invisible
 */
QUnit.test(TEST_TAG + 'new_PixiView_consoleButton', function (assert) {
	//There should be a console Button
	let controlsContainer = pixiView.controlsContainer;
	assert.ok(controlsContainer instanceof PIXI.Container, 'Check the controls container is a PIXI.Container');
	assert.ok(controlsContainer.visible, 'Check the controls container is visible.');

	let setupDoneAsync = assert.async(1);
	function setupDone() {
		setupDoneAsync();
		let consoleButton = controlsContainer.getChildByName(CONSOLE_BUTTON_NAME);
		assert.ok(consoleButton instanceof PIXI.Sprite, 'Check the console button is a Pixi Sprite');
		assert.notOk(pixiView.isParentContainerVisible(), 'Check nothing in the PixiView is visible by default');
	}
	pixiView.setupUI().then(setupDone);
});

/**
 * Given that we've created a new PixiView
 * Then there should be health bar that's setup but invisible
 */
QUnit.test(TEST_TAG + 'new_PixiView_statBars', function (assert) {
	// We should have 1 stat bar which is the health bar
	let statBars = pixiView.statBars;
	assert.ok(statBars.length == 1, 'Check there is 1 item in the stat bars array');
	assert.ok(statBars[0] instanceof PixiStatBar);

	// Grab it an check it's in the right spot
	let healthBar = statBars[0];
	let thirdMapWindowSize = Math.floor(TEST_WINDOW_SIZE / 3);
	let healthBarPosX =  TEST_WINDOW_SIZE- thirdMapWindowSize - 2;;
	let healthBarPosY =  0;
	assert.equal(healthBar.posX, healthBarPosX);
	assert.equal(healthBar.posY, healthBarPosY);
	assert.notOk(healthBar.isVisible(), 'Check by default the Health Bar is hidden.');

});