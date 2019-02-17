import { PageController, LOGIN_FAILURE_MESSAGE_PWD,
	LOGIN_FAILURE_MESSAGE_PLAYER,
	INVALID_JSON_CHARACTER_UPDATE,
	INVALID_JSON_CHARACTER_DATA,
	CHARACTER_UPDATE_SUCCESS_MESSAGE,
	CHARACTER_UPDATE_FAILURE_MESSAGE,
	MOVEMENT_FAILURE_MESSAGE,
	INVALID_LOGIN_MESSAGE } from 'src/controller/page/PageController.js';

import { PixiController } from 'src/controller/pixi/PixiController.js';

import ValidationHandler from 'src/handler/ValidationHandler.js';
import SessionController from 'src/controller/SessionController.js';
import { PageStatsDialogView,
	SET_CHARDETAILS_PROMPT_MESSAGE, CLASS_OPTIONS } from 'src/view/page/PageStatsDialogView.js';
import PageChatView from 'src/view/page/PageChatView.js';
import $ from 'libs/jquery.js';

import { PageView } from 'src/view/page/PageView.js';

var TEST_TAG = '|PAGE CONTROLLER|';

// Default human scores w/ 27 free points
var testSessionId = 12345678;
var testScores = {'STR': 8, 'DEX': 8, 'CON': 8, 'INT': 8, 'WIS': 8, 'CHA': 8};
var testCharData = {
	'charname': 'FooBar',
	'charclass': CLASS_OPTIONS[1].id, //Non-default charclass
	'pos_x': 4,
	'pos_y': 4,
	'health': 100,
	'free_points': 27,
	'scores': testScores,
};
var testUpdateData = {'success': true, 'username': 'foo', 'char-data' : testCharData, 'sessionId' : testSessionId };

var pageView;
var pageController;
var pageStatsDialogView;
var pageChatView;

var serverContextTag;

var TEST_DOCUMENT = document;

// Setup / assertions before any test runs
function beforeAll (assert) {

	// Create an independent document to work on
	//TEST_DOCUMENT = document.implementation.createHTMLDocument('PageView');

	// Build our view in the independent document
	// to avoid clashing with the test window content
	//pageView = PageView;

	//pageView.buildView();
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Make sure we have a fresh controller every time
	// To prevent knock-on state changes
	pageView = new PageView(TEST_DOCUMENT);

	pageController = new PageController(() => {}, pageView, undefined, undefined);
	pageStatsDialogView = pageController.pageStatsDialogView;
	pageChatView = pageController.pageChatView;

	serverContextTag = pageController.pageChatView.getContextTagString('server');

	assert.ok(pageController instanceof PageController, 'Check controller instance is instanciated.');
}

// Using undocumented jQuery _data for events
// to check first click handler
function extractFirstJqueryBinding (domElement, eventType) {
	let boundEvents = $._data(domElement, 'events');
	if (boundEvents !== undefined) {
		return boundEvents[eventType][0].handler;
	} else {
		return undefined;
	}
}

// Hookup before each test setup / assertion
QUnit.module('PageContollerTests', { before: beforeAll, beforeEach: beforeEachTest });

QUnit.test(TEST_TAG + 'setupUI', function (assert) {
	pageView.destroyView();

	assert.equal(pageView.getMainWindowJquery().length, 0, 'Check main window does not exist');

	pageController.setupUI();
	pageView.buildView();
	assert.equal(pageView.getMainWindowJquery().length, 1, 'Check main window exists');

	// Check bindEvents behaviour
	// Using undocumented jQuery _data for events
	// to check first click handler
	var saveStatsButton = pageStatsDialogView.getSaveStatsButton();

	console.log('SaveStatsButton: ');
	console.log($._data(saveStatsButton));
	var events = $._data(saveStatsButton, 'events');
	console.log(events);

	assert.equal(events['click'][0].handler, pageController.sendCharDetails, 'Check our sendCharDetails func is bound to the button.');

	var messageInputField = pageChatView.getMessageInputField();
	var messageInputEvents = $._data(messageInputField, 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, pageController.messageFieldKeyupTrigger, 'Check message field sending on key-up is bound.');
});

QUnit.test(TEST_TAG + 'bindMessageInputPurpose', function (assert) {
	// True for message sending
	pageController.bindMessageInputPurpose(true);
	var messageInputEvents = $._data(pageChatView.getMessageInputField(), 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, pageController.messageFieldKeyupTrigger, 'Check message field sending on key-up is bound.');

	// False for password sending
	pageController.bindMessageInputPurpose(false);
	messageInputEvents = $._data(pageChatView.getMessageInputField(), 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, pageController.passwordFieldKeyupTrigger, 'Check password field sending on key-up is bound.');
});

QUnit.test(TEST_TAG + 'handlePlayerLogin', function (assert) {
	var sessionInfoJson = SessionController.getSessionInfoJSON();
	var expectedSessionJson = {
	  'sessionId': null,
	  'username': null
	};

	assert.deepEqual(sessionInfoJson, expectedSessionJson, 'Check session info JSON is blank');

	assert.ok(ValidationHandler.isValidCharacterData(testCharData), 'Check our test char data is valid');
	var loginData = {'username': 'foo', 'sessionId': testSessionId, 'char-data': testCharData};

	pageController.handlePlayerLogin(loginData);

	var resultingJson = SessionController.getSessionInfoJSON();
	assert.deepEqual(resultingJson, { 'sessionId': loginData.sessionId, 'username': loginData.username }, 'Check session info JSON is now set.');
});

QUnit.test(TEST_TAG + 'checkCharacterDetails_noCharacter', function (assert) {
	// Clear the session character
	SessionController.setClientSessionCharacter({});
	var characterDetailsExist = SessionController.characterDetailsExist();
	var callbacked = false;
	assert.notOk(characterDetailsExist, 'Check character details have not been set for the Session.');

	// Create a new instance to assert the callback
	let characterDetailsConfirmedCallback = function () {
		callbacked = true;
	};

	// Try calling with our character details set.
	pageController = new PageController(characterDetailsConfirmedCallback);
	pageController.checkCharacterDetails();

	var statsInfoFieldVal = pageStatsDialogView.getStatsInfoFieldValue();
	let expectedMessageThere = (statsInfoFieldVal.indexOf(SET_CHARDETAILS_PROMPT_MESSAGE) !== -1);
	assert.ok(expectedMessageThere, 'Check we prompt for character details if they are not set');
	assert.notOk(callbacked, 'Ensure the character details confirmed callback is not called.');
});

QUnit.test(TEST_TAG + 'checkCharacterDetails_characterSet', function (assert) {
	// Clear the session character
	SessionController.setClientSessionCharacter({});
	var characterDetailsExist = SessionController.characterDetailsExist();
	var callbacked = false;
	assert.notOk(characterDetailsExist, 'Check character details have not been set for the Session.');
	// Set some Sesstion data
	SessionController.updateCharacterDetails(testCharData);
	characterDetailsExist = SessionController.characterDetailsExist();
	assert.ok(characterDetailsExist, 'Check character details have been set for the Session.');

	// Create a new instance to assert the callback
	let characterDetailsConfirmedCallback = function () {
		callbacked = true;
	};

	// Try calling with our character details set.
	pageController = new PageController(characterDetailsConfirmedCallback);
	pageController.checkCharacterDetails();
	assert.ok(callbacked, 'Ensure the character details confirmed callback is called.');
});

QUnit.test(TEST_TAG + 'handlePlayerLoginError', function (assert) {
	// Make sure the message log is blank to begin with
	pageChatView.clearMessageLog();

	// Blank data will assume the player does not exist
	let serverData = {};
	let expectedMessage = serverContextTag + LOGIN_FAILURE_MESSAGE_PLAYER + '\n';
	pageController.handlePlayerLoginError(serverData);
	assert.equal(pageChatView.getMessageLogValue(), expectedMessage);

	// Otherwise you'll get a password error
	pageChatView.clearMessageLog();
	serverData['playerExists'] = true;
	expectedMessage = serverContextTag + LOGIN_FAILURE_MESSAGE_PWD + '\n';
	pageController.handlePlayerLoginError(serverData);
	assert.equal(pageChatView.getMessageLogValue(), expectedMessage);
});

QUnit.test(TEST_TAG + 'handleCharacterUpdateResponse', function (assert) {
	{
	let messageData = {};
	let expectedMessage = '';

	// 1. No data
	let badDataError = new RangeError(INVALID_JSON_CHARACTER_UPDATE);
	try {
		pageController.handleCharacterUpdateResponse(messageData);
	} catch (err) {
		assert.deepEqual(err, badDataError, 'Ensure the correct RangeError is thrown if no character update data is returned.');
	}

	// 2. Invalid data
	pageStatsDialogView.clearStatsInfoField();
	// no char-data attrib
	messageData = { success: false };
	try {
		pageController.handleCharacterUpdateResponse(messageData);
	} catch (err) {
		assert.deepEqual(err, badDataError, 'Ensure the correct RangeError is thrown if bad character update data is returned.');
	}

	// 3. Valid data but Update failed
	pageStatsDialogView.clearStatsInfoField();
	messageData =	JSON.parse(JSON.stringify(testUpdateData));
	messageData.success = false;
	expectedMessage = serverContextTag + CHARACTER_UPDATE_FAILURE_MESSAGE + '\n';
	pageController.handleCharacterUpdateResponse(messageData);
	assert.equal(pageStatsDialogView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update failed if the response says so.');

	// 4. Success
	pageStatsDialogView.clearStatsInfoField();
	expectedMessage = serverContextTag + CHARACTER_UPDATE_SUCCESS_MESSAGE + '\n';
	pageController.handleCharacterUpdateResponse(testUpdateData);
	assert.equal(pageStatsDialogView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update success if the response says so.');

	// Check even our try/catch assertions have run
	// Must +1 for this call
	assert.expect(5);

	}
});

QUnit.test(TEST_TAG + 'saveCharacterData', function (assert) {
	// var stats = pageStatsDialogView.getStats ();
	var expectedStats = {'charname': testCharData.charname,
		'charclass': testCharData.charclass,
		'attributes': testCharData.scores};

	// 1. Valid update
	pageStatsDialogView.clearStatsInfoField();
	assert.ok(pageController.saveCharacterData(testCharData), 'Ensure we can save our test char data.');
	let stats = pageStatsDialogView.getStats();
	assert.deepEqual(stats, expectedStats, 'Check our stats are set as expected');

	// 2. Bad data
	// Copy the original and modify
	var badResponse = {'charname': 'roo', 'pos_x': 10, 'pos_y': 10, 'health': 100, 'charclass': 'fighter', 'free_points': 5, 'scores': {}};
	try {
		assert.notOk(pageController.saveCharacterData(badResponse), 'Ensure we fail to save our bad data.');
	} catch (err) {
		assert.deepEqual(err, new RangeError(INVALID_JSON_CHARACTER_DATA), 'Check a RangeError is thrown if we try to save bad character data.');
	}

	// 3. Empty data
	var emptyData = {};
	try {
		assert.notOk(pageController.saveCharacterData(emptyData), 'Ensure we fail to save our bad data.');
	} catch (err) {
		assert.deepEqual(err, new RangeError(INVALID_JSON_CHARACTER_DATA), 'Check a RangeError is thrown if we try to save empty character data.');
	}

	// 4. Garbage data
	var trashData = {'a': 'b', 'c': 'd'};
	try {
		pageController.saveCharacterData(trashData);
	} catch (err) {
		assert.deepEqual(err, new RangeError(INVALID_JSON_CHARACTER_DATA), 'Check a RangeError is thrown if we try to save crappy character data.');
	}

	// assert the total number of assertions
	assert.expect(6);
});

QUnit.skip(TEST_TAG + 'bindEvents', function (assert) {
	// Already covered
});

QUnit.skip(TEST_TAG + 'sendCharDetails', function (assert) {
	// SocketIO, cannot test
});

QUnit.test(TEST_TAG + 'handleMovementResponse', function (assert) {
	let responseData = {'success': true};
	let expectedMessage = serverContextTag + MOVEMENT_FAILURE_MESSAGE + '\n';

	// 1. Valid - No message
	pageChatView.clearMessageLog();
	pageController.handleMovementResponse(responseData);
	assert.equal(pageChatView.getMessageLogValue(), '', 'Check valid movement response does not leave a message.');

	// 2. Invalid - failure message
	responseData.success = false;
	pageChatView.clearMessageLog();
	pageController.handleMovementResponse(responseData);
	assert.equal(pageChatView.getMessageLogValue(), expectedMessage, 'Check invalid movement response leaves a message.');
});

QUnit.skip(TEST_TAG + 'submitChatMessage', function (assert) {
	// SocketIO, cannot test
});

QUnit.skip(TEST_TAG + 'submitPassword', function (assert) {
	// SocketIO, cannot test
});

QUnit.test(TEST_TAG + 'requestUserPassword', function (assert) {
	// 1. Username is given
	pageController.requestUserPassword(true);
	assert.ok($(pageChatView.getPasswordInputFieldJquery()).is(':visible'), 'Check the password field is showing');

	assert.ok(pageChatView.getMessageLogValue().startsWith('Creating a new user, please enter a password for it: '), 'Check pwd request message.');

	// Check we're set to send a password
	let messageInputEvents = $._data(pageChatView.getMessageInputField(), 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, pageController.passwordFieldKeyupTrigger, 'Check password sending on key-up is bound.');

	// 2. No username passed
	pageController.requestUserPassword();
	assert.equal(pageChatView.getMessageLogValue(), 'Please enter your password: ', 'Check pwd request message.');
});

QUnit.skip(TEST_TAG + 'messageFieldKeyupTrigger', function (assert) {
	// Util, do not test
});

QUnit.skip(TEST_TAG + 'passwordFieldKeyupTrigger', function (assert) {
	// Util, do not test
});

QUnit.test(TEST_TAG + 'bindStageClick', function (assert) {
	var expectedBinding = PixiController.stageClicked;
	var mainWindowDomElem = pageView.getMainWindowJquery()[0];

	// Enabled / Bind
	pageController.bindStageClick(true);
	var clickBinding = extractFirstJqueryBinding(mainWindowDomElem, 'click');
	assert.equal(clickBinding, expectedBinding, 'Check when binding our expected function is bound for stage click.');

	// Disabled / Unbind
	pageController.bindStageClick(false);
	var clickBinding = extractFirstJqueryBinding(mainWindowDomElem, 'click');
	assert.equal(undefined, clickBinding, 'Check unbinding clears the click handler.');
});

QUnit.test(TEST_TAG + 'disableUI', function (assert) {
	pageController.enableUI();
	assert.ok(pageController.uiEnabled, 'UI Should be enabled before attempting disable.');
	pageController.disableUI();

	// Check page click has been unbound
	pageController.bindStageClick(false);
	var mainWindowDomElem = pageView.getMainWindowJquery()[0];
	var clickBinding = extractFirstJqueryBinding(mainWindowDomElem, 'click');
	assert.equal(undefined, clickBinding, 'Check unbinding clears the click handler.');
	
	assert.notOk(pageController.uiEnabled, 'UI Should be disabled now.');
});

QUnit.test(TEST_TAG + 'enableUI', function (assert) {
	assert.notOk(pageController.uiEnabled, 'UI Should be disabled before attempting enable.');
	pageController.enableUI();

	// Check page click has been bound
	var expectedBinding = PixiController.stageClicked;
	var mainWindowDomElem = pageView.getMainWindowJquery()[0];
	pageController.bindStageClick(true);
	var clickBinding = extractFirstJqueryBinding(mainWindowDomElem, 'click');
	assert.equal(expectedBinding, clickBinding, 'Check unbinding clears the click handler.');
	
	assert.ok(pageController.uiEnabled, 'UI Should be enabled now.');
});
