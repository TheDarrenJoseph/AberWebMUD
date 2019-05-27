import { PixiController } from 'src/controller/pixi/PixiController.js';
import { PageView } from 'src/view/page/PageView.js';

var TEST_TAG = '|PIXI CONTROLLER|';

var pixiController;
var TEST_WINDOW;
var TEST_DOCUMENT;

// Setup / assertions before any test runs
function beforeAll (assert) {
	TEST_WINDOW = window.open('', TEST_TAG, "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes")
	TEST_DOCUMENT = TEST_WINDOW.document;

	// DO SOME STUFF
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Make sure we have a fresh controller every time
	// To prevent knock-on state changes
	pixiController = new PixiController(PageView.getWindowDimensions());
	assert.ok(pixiController instanceof PixiController, 'Check controller instance is instanciated.');
}

function tearDown () {
	TEST_WINDOW.close();
}

// Hookup before each test setup / assertion
QUnit.module('PixiControllerTests', { before: beforeAll, beforeEach: beforeEachTest, after: tearDown });

QUnit.skip(TEST_TAG + 'setupConsoleButton', async function (assert) {
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
