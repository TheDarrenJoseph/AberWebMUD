import { Session, SessionModel } from 'src/model/Session.js';

var TEST_TAG = '|SESSION CONTROLLER|';

// Setup / assertions before any test runs
function beforeAll (assert) {
	// DO SOME STUFF
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Re-instanciate Session to clear it
	Session.ActiveSession = new SessionModel();
}

// Hookup before each test setup / assertion
QUnit.module('SessionContollerTests', { before: beforeAll, beforeEach: beforeEachTest })

var TEST_SESSION_ID = "aaa1baa";

QUnit.test(TEST_TAG + 'setSessionId_basic', function (assert) {
	let sessionId = Session.ActiveSession.getSessionId();
	assert.equal(sessionId, undefined, 'Check Session ID has not been set');

	Session.ActiveSession._setSessionId(TEST_SESSION_ID);
	assert.equal(Session.ActiveSession.getSessionId(), TEST_SESSION_ID);
});

/**
 * Given we have set a Session ID on the Session object
 * When we grab the Session ID Cookie
 * Then the originally set SessionID should be returned
 */
QUnit.test(TEST_TAG + 'Session ID Cookie storage', function (assert) {
	let sessionId = Session.ActiveSession.getSessionId();
	assert.equal(sessionId, undefined, 'Check Session ID has not been set');

	Session.ActiveSession.saveSessionIdCookie(TEST_SESSION_ID);
	assert.equal(Session.ActiveSession.getSessionIdCookie(), TEST_SESSION_ID);
});
