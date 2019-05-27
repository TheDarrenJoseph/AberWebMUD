import { PixiController } from 'src/controller/pixi/PixiController.js';
import { PageView } from 'src/view/page/PageView.js';

let TEST_TAG = '|PIXI CONTROLLER|';

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
	// Make sure we have a fresh controller every time
	// To prevent knock-on state changes
	pixiController = new PixiController(PageView.getWindowDimensions());
	assert.ok(pixiController instanceof PixiController, 'Check controller instance is instanciated.');

	assert.notEqual(undefined, pixiController.pixiView, 'Make sure the PixiController PixiView is not undefined.');

	canvasView = await pixiController.enableUI();
	TEST_DOCUMENT.body.appendChild(canvasView);

	// Assert generic things
	assert.ok(canvasView instanceof HTMLCanvasElement, 'Check the Canvas is setup');

	assert.ok(TEST_WINDOW.innerWidth > 100, 'Check the test window width is sane');
	assert.ok(TEST_WINDOW.innerHeight > 100, 'Check the test window height is sane');
	assert.equal(canvasView.width, PageView.getWindowDimensions());
	assert.equal(canvasView.height, PageView.getWindowDimensions());

}

function afterAll () {
	//TEST_WINDOW.close();
}

function afterEachTest () {
	if (TEST_DOCUMENT !== undefined && canvasView !== undefined) {
		//TEST_DOCUMENT.body.removeChild(canvasView);
	}
}

// Hookup before each test setup / assertion
QUnit.module('PixiControllerTests', { before: beforeAll, beforeEach: beforeEachTest, after: afterAll, afterEach : afterEachTest });

QUnit.skip(TEST_TAG + 'initialSetupDone_consoleButton', async function (assert) {
	//There should be a console Button
	let consoleButton = pixiController.pixiView.consoleButtonSprite;
	assert.ok(consoleButton instanceof PIXI.Sprite, 'Check the console button is a Pixi Sprite');
	assert.ok(consoleButton.visible, 'Check the chat console button is displayed/visible.');
});
