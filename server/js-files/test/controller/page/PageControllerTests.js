import PageController from 'src/controller/page/PageController.js';
import { LOGIN_FAILURE_MESSAGE_PWD, 
	LOGIN_FAILURE_MESSAGE_PLAYER,
	INVALID_JSON_CHARACTER_UPDATE,
	INVALID_JSON_CHARACTER_DATA,
	CHARACTER_UPDATE_SUCCESS_MESSAGE,
	CHARACTER_UPDATE_FAILURE_MESSAGE,
	MOVEMENT_FAILURE_MESSAGE,
	INVALID_LOGIN_MESSAGE } from 'src/controller/page/PageController.js';

import PageStatsDialogView from 'src/view/page/PageStatsDialogView.js';
import PageChatView from 'src/view/page/PageChatView.js';
import $ from 'libs/jquery.js';

import { PageView }  from 'src/view/page/PageView.js';

var TEST_TAG = '|PAGE CONTROLLER|';
const serverContextTag = PageChatView.getContextTagString('server');

const testCharData = {"charname":"roo","pos_x":10,"pos_y":10,"health":100, "charclass":"fighter","free_points":5, "scores": {"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}};

// Setup / assertions before any test runs
function beforeAll (assert) {
	// DO SOME STUFF
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Destroy and rebuild the views
	PageView.destroyView();
	PageView.buildView ();
	PageStatsDialogView.buildView ();
	PageChatView.buildView ();
}

// Hookup before each test setup / assertion
QUnit.module('PageContollerTests', { before: beforeAll, beforeEach: beforeEachTest })

QUnit.test(TEST_TAG + 'setupUI', function (assert) {
	PageView.destroyView();
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
});

QUnit.test(TEST_TAG + 'bindMessageInputPurpose', function (assert) {
	// True for message sending
	PageController.bindMessageInputPurpose(true);
	var messageInputEvents = $._data(PageChatView.getMessageInputField(), 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, PageController.messageFieldKeyupTrigger, 'Check message field sending on key-up is bound.');
	
	// False for password sending
	PageController.bindMessageInputPurpose(false);
	messageInputEvents = $._data(PageChatView.getMessageInputField(), 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, PageController.passwordFieldKeyupTrigger, 'Check password field sending on key-up is bound.');
});

QUnit.test(TEST_TAG + 'handlePlayerLoginError', function (assert) {
	// Make sure the message log is blank to begin with
	PageChatView.clearMessageLog();
	
	// Blank data will assume the player does not exist
	let serverData = {};
	let expectedMessage = serverContextTag + LOGIN_FAILURE_MESSAGE_PLAYER + '\n';
	PageController.handlePlayerLoginError(serverData);
	assert.equal(PageChatView.getMessageLogValue(), expectedMessage);
	
	// Otherwise you'll get a password error
	PageChatView.clearMessageLog();
	serverData['playerExists'] = true;
	expectedMessage = serverContextTag + LOGIN_FAILURE_MESSAGE_PWD + '\n';
	PageController.handlePlayerLoginError(serverData);
	assert.equal(PageChatView.getMessageLogValue(), expectedMessage);
});

QUnit.test(TEST_TAG + 'handleCharacterUpdateResponse', function (assert) {
	// Check even our try/catch assertions run
	assert.expect(4);
	
	let messageData = {};
	let expectedMessage = '';

	// 1. No data
	let badDataError = new RangeError(INVALID_JSON_CHARACTER_UPDATE);
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
	messageData = { 'success': false, 'char-data': testCharData };
	expectedMessage = serverContextTag + CHARACTER_UPDATE_FAILURE_MESSAGE + '\n';
	PageController.handleCharacterUpdateResponse(messageData);
	assert.equal(PageStatsDialogView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update failed if the response says so.');
	
	// 4. Success
	PageStatsDialogView.clearStatsInfoField();
	messageData = { 'success': true, 'char-data': testCharData };
	expectedMessage = serverContextTag + CHARACTER_UPDATE_SUCCESS_MESSAGE + '\n';
	PageController.handleCharacterUpdateResponse(messageData);
	assert.equal(PageStatsDialogView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update success if the response says so.');

});

QUnit.test(TEST_TAG + 'saveCharacterData', function (assert) {
	var charUpdateData = {"charname":"roo","pos_x":10,"pos_y":10,"health":100, "charclass":"fighter","free_points":5, "scores": {"STR":1,"DEX":2,"CON":3,"INT":4,"WIS":5,"CHA":6}};

	//var stats = PageStatsDialogView.getStats ();
	var expectedStats = {'charname': charUpdateData.charname,
		'charclass' : charUpdateData.charclass,
		'attributes' : charUpdateData.scores};
	
	// 1. Valid update
	PageStatsDialogView.clearStatsInfoField();
	PageController.saveCharacterData(charUpdateData);
	let stats = PageStatsDialogView.getStats ();
	assert.deepEqual(stats, expectedStats, 'Check our stats are set as expected');

	// Check the message is displayed
	//PageStatsDialogView.updateStatsInfoLog(CHARACTER_UPDATE_SUCCESS_MESSAGE, 'server');
	let expectedMessage = serverContextTag + CHARACTER_UPDATE_SUCCESS_MESSAGE + '\n';
	assert.equal(PageStatsDialogView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update success if the response says so.');
	
	// 2. Bad data	
	var badDataNoScores = {"charname":"roo","pos_x":10,"pos_y":10,"health":100, "charclass":"fighter","free_points":5, "scores": {}};
	try { 
		PageController.saveCharacterData(badDataNoScores);
	} catch (err) {	
		assert.deepEqual(err, new RangeError(INVALID_JSON_CHARACTER_DATA), 'Check a RangeError is thrown if we try to save bad character data.');
	}
	
	// 3. Empty data
	var emptyData = {};
	try { 
		PageController.saveCharacterData(emptyData);
	} catch (err) {	
		assert.deepEqual(err, new RangeError(INVALID_JSON_CHARACTER_DATA), 'Check a RangeError is thrown if we try to save empty character data.');
	}
	
	// 4. Garbage data
	var trashData = {"a":"b", "c":"d"};
	var emptyData = {};
	try { 
		PageController.saveCharacterData(trashData);
	} catch (err) {	
		assert.deepEqual(err, new RangeError(INVALID_JSON_CHARACTER_DATA), 'Check a RangeError is thrown if we try to save crappy character data.');
	}
	
	// 5. Legit w/ invalid values??
	
	// assert the total number of assertions
	assert.expect(5);
});

QUnit.skip(TEST_TAG + 'bindEvents', function (assert) {
	// Already covered
});

QUnit.skip(TEST_TAG + 'sendCharDetails', function (assert) {
	// SocketIO, cannot test
});

QUnit.test(TEST_TAG + 'handleMovementResponse', function (assert) {
	let responseData = {'success':true};
	let expectedMessage = serverContextTag + MOVEMENT_FAILURE_MESSAGE + '\n';
	
	// 1. Valid - No message
	PageChatView.clearMessageLog();
	PageController.handleMovementResponse(responseData);
	assert.equal(PageChatView.getMessageLogValue(), '', 'Check valid movement response does not leave a message.');
	
	// 2. Invalid - failure message
	responseData.success = false;
	PageChatView.clearMessageLog();
	PageController.handleMovementResponse(responseData);
	assert.equal(PageChatView.getMessageLogValue(), expectedMessage, 'Check invalid movement response leaves a message.');
	
});

QUnit.skip(TEST_TAG + 'submitChatMessage', function (assert) {
	// SocketIO, cannot test
});

QUnit.skip(TEST_TAG + 'submitPassword', function (assert) {
	// SocketIO, cannot test
});

QUnit.test(TEST_TAG + 'requestUserPassword', function (assert) {
	// 1. Username is given
	PageController.requestUserPassword('foo');
	assert.ok($(PageChatView.getPasswordInputField()).is(':visible'), 'Check the password field is showing');
	
	assert.ok(PageChatView.getMessageLogValue().startsWith('Please enter the password for user: '), 'Check pwd request message.');

	// Check we're set to send a password
	let messageInputEvents = $._data(PageChatView.getMessageInputField(), 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, PageController.passwordFieldKeyupTrigger, 'Check password sending on key-up is bound.');
	
	// 2. No username passed
	PageController.requestUserPassword();
	assert.equal(PageChatView.getMessageLogValue(), 'Account created, please enter your password.', 'Check pwd request message.');
});

QUnit.skip(TEST_TAG + 'newUserPassword', function (assert) {
	assert.ok(false, 'TODO');
});

QUnit.skip(TEST_TAG + 'messageFieldKeyupTrigger', function (assert) {
	// Util, do not test
});

QUnit.skip(TEST_TAG + 'passwordFieldKeyupTrigger', function (assert) {
	// Util, do not test
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

