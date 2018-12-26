import { PixiController, PixiControllerClass } from 'src/controller/pixi/PixiController.js';

var TEST_TAG = '|PIXI CONTROLLER|';

var pixiController;

// Setup / assertions before any test runs
function beforeAll (assert) {
	// DO SOME STUFF
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Make sure we have a fresh controller every time
	// To prevent knock-on state changes
	pixiController = new PixiControllerClass();
	assert.ok(pixiController instanceof PixiControllerClass, 'Check controller instance is instanciated.');
}

// Hookup before each test setup / assertion
QUnit.module('PixiControllerTests', { before: beforeAll, beforeEach: beforeEachTest })

QUnit.test(TEST_TAG + 'setupConsoleButton', async function (assert) {
	await pixiController.setupConsoleButton();
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'setupContextButtons', function (assert) {
	pixiController.setupContextButtons();
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'setupUI', function (assert) {
	pixiController.setupUI();
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'setupContextButtons', function (assert) {
	pixiController.setupContextButtons();
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'setupPixiUI', function (assert) {
	pixiController.setupPixiUI();
	assert.ok(false, 'TODO');
});
