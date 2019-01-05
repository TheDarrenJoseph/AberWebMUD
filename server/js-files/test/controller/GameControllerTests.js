import GameController from 'src/controller/GameController.js';

var TEST_TAG = '|GAME CONTROLLER|';

// Setup / assertions before any test runs
function beforeAll (assert) {
	// DO SOME STUFF
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// DO SOME STUFF
}

// Hookup before each test setup / assertion
QUnit.module('SessionContollerTests', { before: beforeAll, beforeEach: beforeEachTest })

QUnit.skip(TEST_TAG + 'checkCharacterDetails', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'handlePlayerLogin', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'performSetup', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'characterDetailsConfirmed', function (assert) {
	assert.ok(false, 'TODO');
});
