import PageController from 'src/controller/page/PageController.js';
import { LOGIN_FAILURE_MESSAGE_PWD, 
	LOGIN_FAILURE_MESSAGE_PLAYER,
	INVALID_JSON_CHARACTER,
	CHARACTER_UPDATE_SUCCESS_MESSAGE,
	CHARACTER_UPDATE_FAILURE_MESSAGE } from 'src/controller/page/PageController.js';

import PageStatsDialogView from 'src/view/page/PageStatsDialogView.js';
import PageChatView from 'src/view/page/PageChatView.js';
import $ from 'libs/jquery.js';

import { PageView }  from 'src/view/page/PageView.js';

var TEST_TAG = '|PAGE CONTROLLER|';
const serverContextTag = PageChatView.getContextTagString('server');

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
	assert.equal(PageView.getMainWindowJquery().length, 0, 'Check main window does not exist');

	PageController.setupUI();
	
	assert.equal(PageView.getMainWindowJquery().length, 1, 'Check main window exists');
	
	// Check bindEvents behaviour
	// Using undocumented jQuery _data for events 
	// to check first click handler
	var saveStatsButton = PageStatsDialogView.getSaveStatsButton();
	var events = $._data(saveStatsButton, 'events');
	assert.equal(events['click'][0].handler, PageController.sendCharDetails, 'Check our sendCharDetails func is bound to the button.');
	
	var messageInputField = PageChatView.getMessageInputField();
	var messageInputEvents = $._data(messageInputField, 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, PageController.messageFieldKeyupTrigger, 'Check message field sending on key-up is bound.');
	
	console.log(PageStatsDialogView.getStatsAttributeValues());
});

QUnit.test(TEST_TAG + 'bindMessageInputPurpose', function (assert) {
	var messageInputEvents = $._data(PageChatView.getMessageInputField(), 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, PageController.messageFieldKeyupTrigger, 'Check message field sending on key-up is bound.');
	
	// True for message sending
	PageController.bindMessageInputPurpose(true);
	messageInputEvents = $._data(PageChatView.getMessageInputField(), 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, PageController.messageFieldKeyupTrigger, 'Check message field sending on key-up is bound.');
	
	// False for password sending
	PageController.bindMessageInputPurpose(false);
	messageInputEvents = $._data(PageChatView.getMessageInputField(), 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, PageController.passwordFieldKeyupTrigger, 'Check message field sending on key-up is bound.');
});

QUnit.test(TEST_TAG + 'handlePlayerLoginError', function (assert) {
	// Make sure the message log is blank to begin with
	PageChatView.clearMessageLog();
	
	// Blank data will assume the player does not exist
	let serverData = {};
	PageController.handlePlayerLoginError(serverData);
	assert.equal(PageChatView.getMessageLogValue(), serverContextTag + LOGIN_FAILURE_MESSAGE_PLAYER + '\n');
	
	// Otherwise you'll get a password error
	// Make sure we append to the existing console log value
	serverData['playerExists'] = true;
	let expectedMessage = PageChatView.getMessageLogValue() + serverContextTag + LOGIN_FAILURE_MESSAGE_PWD + '\n';
	PageController.handlePlayerLoginError(serverData);
	assert.equal(PageChatView.getMessageLogValue(), expectedMessage);
});

QUnit.test(TEST_TAG + 'handleCharacterUpdateResponse', function (assert) {
	// Check even our try/catch assertions run
	assert.expect(4);
	
	let messageData = {};
	let charData = {"charname":"roo","pos_x":10,"pos_y":10,"health":100, "charclass":"fighter","free_points":5, "scores": {"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}};
	let expectedMessage = '';

	// 1. No data
	let badDataError = new RangeError(INVALID_JSON_CHARACTER);
	try {
		PageController.handleCharacterUpdateResponse(messageData);
	} catch (err) {
		assert.deepEqual(err, badDataError, 'Ensure the correct RangeError is thrown if no character update data is returned.');
	}
	
	// 2. Invalid data
	PageStatsDialogView.clearStatsInfoField();
	// no char-data attrib
	messageData = { success: false };
	try {
		PageController.handleCharacterUpdateResponse(messageData);
	} catch (err) {
		assert.deepEqual(err, badDataError, 'Ensure the correct RangeError is thrown if bad character update data is returned.');
	}
	
	// 3. Valid data but Update failed
	PageStatsDialogView.clearStatsInfoField();
	messageData = { 'success': false, 'char-data': charData };
	expectedMessage = serverContextTag + CHARACTER_UPDATE_FAILURE_MESSAGE + '\n';
	PageController.handleCharacterUpdateResponse(messageData);
	assert.equal(PageStatsDialogView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update failed if the response says so.');
	
	// 4. Success
	PageStatsDialogView.clearStatsInfoField();
	messageData = { 'success': true, 'char-data': charData };
	expectedMessage = serverContextTag + CHARACTER_UPDATE_SUCCESS_MESSAGE + '\n';
	PageController.handleCharacterUpdateResponse(messageData);
	assert.equal(PageStatsDialogView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update success if the response says so.');

});

QUnit.skip(TEST_TAG + 'saveCharacterUpdate', function (assert) {
	//PageStatsDialogView.setStatsFromJsonResponse(characterData);
	//SessionController.updateClientSessionData(characterData);
	//PageStatsDialogView.updateStatsInfoLog(CHARACTER_UPDATE_SUCCESS_MESSAGE, 'server');
	
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

