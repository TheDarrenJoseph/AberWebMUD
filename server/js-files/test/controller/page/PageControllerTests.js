import PageStatsDialogView from 'src/view/page/PageStatsDialogView.js';

import { PageController } from 'src/controller/page/PageController.js';

var TEST_TAG = '|PAGE CONTROLLER|';

// Setup / assertions before any test runs
function beforeAll (assert) {
	// DO SOME STUFF
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// DO SOME STUFF
}

// Hookup before each test setup / assertion
QUnit.module('PageContollerTests', { before: beforeAll, beforeEach: beforeEachTest })

QUnit.test(TEST_TAG + 'setupUI', function (assert) {
	var saveStatsButton = $(PageStatsDialogView._SAVE_STATS_BUTTON_CLASS_SELECTOR);
	var bindIndex = $._data(saveStatsButton,'events').indexOf("click");
	
	assert.notEqual(bindIndex, -1, 'Ensure the save stats button is bound to something');
});

QUnit.skip(TEST_TAG + 'bindMessageInputPurpose', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'handlePlayerLoginError', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'handleCharacterUpdateResponse', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'saveCharacterUpdate', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'bindEvents', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'sendCharDetails', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'handleMovementResponse', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'submitChatMessage', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'submitPassword', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'requestUserPassword', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'userDoesNotExist', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'messageFieldKeyupTrigger', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'passwordFieldKeyupTrigger', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'bindStageClick', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'disableUI', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'enableUI', function (assert) {
	assert.ok(false, 'TODO');
});

