import { Session, SessionModel } from 'src/model/Session.js';
import { ViewController } from 'src/controller/ViewController.js';
import { _MAIN_WINDOW_ID, _GAME_WINDOW_ID } from 'src/view/page/PageView.js';
import  { _INVENTORY_WINDOW_ID } from 'src/view/page/PageInventoryView.js';
import  { _STATS_WINDOW_ID } from 'src/view/page/PageCharacterDetailsView.js';
import { _MESSAGE_WINDOW_ID } from 'src/view/page/PageChatView.js';

import  * as TestWindow from 'test/utils/TestWindow.js'
import { STATBAR_ID_HEALTH, CONSOLE_BUTTON_NAME, INVENTORY_BUTTON_NAME, STATS_BUTTON_NAME } from 'src/view/pixi/PixiView.js'

var TEST_TAG = '|VIEW CONTROLLER|';
var MAX_TIMEOUT = 5000;

var viewController;
var TEST_WINDOW = null;
var TEST_DOCUMENT = null;

// Setup / assertions before any test runs
function beforeAll (assert) {
	TEST_WINDOW = TestWindow.buildTestWindow(TEST_TAG);
	TEST_DOCUMENT = TEST_WINDOW.document;
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Re-instanciate Session to clear it
	Session.ActiveSession = new SessionModel();
	viewController = new ViewController(TEST_DOCUMENT);
}

function afterAll () {
	//TEST_WINDOW.close();
}


// Hookup before each test setup / assertion
QUnit.module('ViewControllerTests', { before: beforeAll, beforeEach: beforeEachTest, after: afterAll })

/**
 * GIVEN I have a new instance of ViewController
 * WHEN I call setupUI and it's promise resolves
 * THEN I expect all UI components to be initialised, with the canvas blank and all windows hidden.
 */
QUnit.test(TEST_TAG + 'setupUI', function (assert) {
	assert.timeout(MAX_TIMEOUT);

	let viewSetup = assert.async(1);
	viewController.setupUI().then(() =>{

		let pageController = viewController.getPageController();
		let pageView = pageController.getPageView();
		let pageCharacterDetailsView = pageController.getPageCharacterDetailsView();
		let pageInventoryView = pageController.getPageInventoryView();
		let pageChatView = pageController.getPageChatView();

		// --- Page View
		assert.ok(pageView.isElementVisible(_MAIN_WINDOW_ID), 'Main window div should be visible')
		assert.ok(pageView.isElementVisible(_GAME_WINDOW_ID), 'Game window div should be visible')

		assert.notOk(pageCharacterDetailsView.isElementVisible(_STATS_WINDOW_ID), 'Stat window div should be hidden')
		assert.notOk(pageInventoryView.isElementVisible(_INVENTORY_WINDOW_ID), 'Inventory window div should be hidden')
		assert.notOk(pageChatView.isElementVisible(_MESSAGE_WINDOW_ID), 'Message window div should be hidden')

		// --- Pixi View
		let pixiController = viewController.getPixiController();
		let pixiView = pixiController.getPixiView();

		// Pixi View Controls should be hidden
		// Stats bars (health)
		let healthBar = pixiView.getStatBar(STATBAR_ID_HEALTH)
		assert.notOk(healthBar.isVisible(), 'Ensure the Pixi UI Health bar is hidden.');

		// Control buttons
		let consoleButton 	= pixiView.getContextControl(CONSOLE_BUTTON_NAME);
		let statsButton 		= pixiView.getContextControl(STATS_BUTTON_NAME);
		let inventoryButton = pixiView.getContextControl(INVENTORY_BUTTON_NAME);
		assert.notOk(consoleButton.visible, 'Ensure the console button is not displayed.');
		assert.notOk(statsButton.visible, 'Ensure the stats button is not displayed.');
		assert.notOk(inventoryButton.visible, 'Ensure the inventory button is not displayed.');

		viewSetup();
	})
	.catch(rejection => {
		console.error(rejection);
	})

	assert.expect(9);
}
);