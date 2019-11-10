import sinon from 'libs/sinon-7.4.1.js';

import {TEST_SESSIONID, TEST_USERNAME, TEST_CHARUPDATE_DATA} from '../utils/data/TestSessionData.js';
import {TEST_SCORES, TEST_CHARDATA, TEST_ATTRIBUTES_RESPONSE, TEST_CHARACTER_CLASS_OPTIONS} from '../utils/data/TestCharacterDetails.js';

import { GameControllerClass } from '../../src/controller/GameController.js';
import { CharacterDetails } from '../../src/model/page/CharacterDetails.js'
import { Session, SessionModel } from '../../src/model/Session.js';
import  * as TestWindow from '../utils/TestWindow.js'
import { CharacterDetailsBuilder } from '../../src/model/page/CharacterDetailsBuilder'

var TEST_TAG = '|GAME CONTROLLER|';
var TEST_WINDOW = null;
var TEST_DOCUMENT = null;

var gameController = null;

// Setup / assertions before any test runs
function beforeAll (assert) {
	TEST_WINDOW = TestWindow.buildTestWindow(TEST_TAG);
	TEST_DOCUMENT = TEST_WINDOW.document;
	gameController = new GameControllerClass(TEST_DOCUMENT);

	let pageController = gameController.getViewController().getPageController();

	// Stub out HTTP calls with promises for testing data
	let fetchAttributesStub = sinon.stub(pageController, 'fetchAttributes').resolves(TEST_ATTRIBUTES_RESPONSE);
	let fetchCharacterClassOptionsStub = sinon.stub(pageController, 'fetchCharacterClassOptions').resolves(TEST_CHARACTER_CLASS_OPTIONS);
	let fetchPlayerDataStub = sinon.stub(gameController, 'fetchPlayerData').resolves(TEST_CHARUPDATE_DATA);
}

function afterAll (assert) {
	sinon.restore()
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Re-instanciate Session to clear it
	Session.ActiveSession = new SessionModel();

	return gameController.viewController.setupUI();
}

// Hookup before each test setup / assertion
QUnit.module('GameContollerTests', { before: beforeAll, beforeEach: beforeEachTest, after: afterAll }, () => {

	/**
	 * GIVEN I have a new GameController
	 * WHEN I handle the player login data from the server's login success response
	 * THEN I expect the background client session model to update to reflect the values returned
	 */
	QUnit.test(TEST_TAG + 'handlePlayerLogin_updateSessionData', function (assert) {
		var sessionInfoJson = Session.ActiveSession.getSessionInfoJSON();
		var blankSessionJson = {
			'sessionId': null,
			'username': ""
		};
		assert.deepEqual(sessionInfoJson, blankSessionJson, 'Check session info JSON is blank');

		var loginData = { 'sessionId': TEST_SESSIONID, 'username': TEST_USERNAME };
		let playerLoginPromise = gameController.handlePlayerLogin(loginData);
		let playerDataUpdated = assert.async(1);
		playerLoginPromise.then(() => {
			var resultingJson = Session.ActiveSession.getSessionInfoJSON();
			assert.deepEqual(resultingJson, {
				'sessionId': loginData.sessionId,
				'username': loginData.username
			}, 'Check session info JSON is now set.');
			playerDataUpdated();
		});
	});

});