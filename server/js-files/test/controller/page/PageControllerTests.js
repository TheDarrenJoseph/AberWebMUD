import PageController from 'src/controller/page/PageController.js';
import { LOGIN_FAILURE_MESSAGE_PWD, LOGIN_FAILURE_MESSAGE_PLAYER } from 'src/controller/page/PageController.js';

import PageStatsDialogView from 'src/view/page/PageStatsDialogView.js';
import PageChatView from 'src/view/page/PageChatView.js';
import $ from 'libs/jquery.js';

import { PageView }  from 'src/view/page/PageView.js';

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
	// Messages will be context tagged as from the server
	let serverContextTag = PageChatView.getContextTagString('server');
	
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

