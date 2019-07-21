import {TEST_SESSIONID, TEST_SCORES, TEST_CHARDATA, TEST_CHARUPDATE_DATA} from 'test/utils/data/TestSessionData.js';

import { GameController } from 'src/controller/GameController.js';
import { CharacterDetails } from 'src/model/page/CharacterDetails.js'
import { Session, SessionModel } from 'src/model/Session.js';

var TEST_TAG = '|GAME CONTROLLER|';

// Setup / assertions before any test runs
function beforeAll (assert) {

}

// Setup / assertions before each test
async function beforeEachTest (assert) {
	// Re-instanciate Session to clear it
	Session.ActiveSession = new SessionModel();

	await GameController.viewController.setupUI();
}

// Hookup before each test setup / assertion
QUnit.module('GameContollerTests', { before: beforeAll, beforeEach: beforeEachTest })

QUnit.test(TEST_TAG + 'handlePlayerLogin_updateSessionData', function (assert) {
	var sessionInfoJson = Session.ActiveSession.getSessionInfoJSON();
	var expectedSessionJson = {
		'sessionId': null,
		'username': ""
	};

	assert.deepEqual(sessionInfoJson, expectedSessionJson, 'Check session info JSON is blank');

	assert.ok(CharacterDetails.isValidCharacterData(TEST_CHARDATA), 'Check our test char data is valid');
	var loginData = {'sessionId': TEST_SESSIONID, 'player-status' : { 'username': 'foo', 'char-details': TEST_CHARDATA }};

	GameController.handlePlayerLogin(loginData);

	var resultingJson = Session.ActiveSession.getSessionInfoJSON();
	assert.deepEqual(resultingJson, { 'sessionId': loginData.sessionId, 'username': loginData.username }, 'Check session info JSON is now set.');
});
