//const $ = require('jquery');
//import $ from 'libs/jquery.js';

import jquery from 'jquery';

import { jQueryUtils } from 'test/utils/jQueryUtils.js';

import {TEST_SESSIONID, TEST_SCORES, TEST_CHARDATA, TEST_CHARUPDATE_DATA} from 'test/utils/data/TestSessionData.js';

import { PageController, LOGIN_FAILURE_MESSAGE_PWD,
	LOGIN_FAILURE_MESSAGE_PLAYER,
	INVALID_JSON_CHARACTER_UPDATE,
	INVALID_JSON_CHARACTER_DATA,
	CHARACTER_UPDATE_SUCCESS_MESSAGE,
	CHARACTER_UPDATE_FAILURE_MESSAGE,
	MOVEMENT_FAILURE_MESSAGE,
	INVALID_LOGIN_MESSAGE } from 'src/controller/page/PageController.js';
import { PixiController } from 'src/controller/pixi/PixiController.js';
import { Session } from 'src/model/Session.js';
import { Page } from 'src/model/page/Page.js';
import { EVENTS as pageStatsEvents, SET_CHARDETAILS_PROMPT_MESSAGE, PageCharacterDetailsView} from 'src/view/page/PageCharacterDetailsView.js';
import PageChatView from 'src/view/page/PageChatView.js';
import { CLASS_OPTIONS } from 'src/model/page/CharacterDetails.js';
import { PageView } from 'src/view/page/PageView.js';
import { CharacterDetails } from 'src/model/page/CharacterDetails.js'

var TEST_TAG = '|PAGE CONTROLLER|';

var pageView;
var pageController;
var pageCharacterDetailsView;
var pageChatView;

var serverContextTag;

var TEST_DOCUMENT = document;

// Unmodified char details for reference
var DEFAULT_CHARACTERDETAILS = new CharacterDetails();

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
	var pageModel = new Page(TEST_DOCUMENT);
	pageView = new PageView(pageModel);


	pageCharacterDetailsView = new PageCharacterDetailsView(pageView, new CharacterDetails());
	pageChatView = new PageChatView(pageModel);

	pageController = new PageController(TEST_DOCUMENT, pageView, pageCharacterDetailsView, pageChatView);
	// Perform Document based (HTML Elements, etc) setup

	pageController.setupUI();

	serverContextTag = pageChatView.getContextTagString('server')
	assert.ok(pageController instanceof PageController, 'Check controller instance is instanciated.');
}



// Hookup before each test setup / assertion
QUnit.module('PageContollerTests', { before: beforeAll, beforeEach: beforeEachTest });

QUnit.test(TEST_TAG + 'setupUI', function (assert) {
	pageView.destroyView();

	assert.equal(pageView.getMainWindowJquery().length, 0, 'Check main window does not exist');

	pageController.setupUI();
	pageView.buildView();
	assert.equal(pageView.getMainWindowJquery().length, 1, 'Check main window exists');
});

QUnit.test(TEST_TAG + 'bindMessageInputPurpose', function (assert) {
	// True for message sending
	pageController.bindMessageInputPurpose(true);
	//var messageInputEvents = jquery._data(pageChatView.getMessageInputField(), 'events');
	var messageInputEvents = jQueryUtils.getEventsForElement(pageChatView.getMessageInputField());
	assert.equal(messageInputEvents['keyup'][0].handler, pageController.messageFieldKeyupTrigger, 'Check message field sending on key-up is bound.');

	// False for password sending
	pageController.bindMessageInputPurpose(false);
	//messageInputEvents = jquery._data(pageChatView.getMessageInputField(), 'events');
	messageInputEvents = jQueryUtils.getEventsForElement(pageChatView.getMessageInputField());

	assert.equal(messageInputEvents['keyup'][0].handler, pageController.passwordFieldKeyupTrigger, 'Check password field sending on key-up is bound.');
});

QUnit.test(TEST_TAG + 'checkCharacterDetails_noCharacter', function (assert) {

	// Reset the character details
	pageController.characterDetails = new CharacterDetails();
	var characterDetails = pageController.characterDetails;
	var callbacked = false;
	assert.deepEqual(DEFAULT_CHARACTERDETAILS, characterDetails, 'Check character details have not been set for the Session.');

	// Create a new instance to assert the callback
	let characterDetailsConfirmedCallback = function () {
		callbacked = true;
	};

	// Try calling with our character details set.
	pageController = new PageController();
	pageController.checkCharacterDetails(characterDetailsConfirmedCallback);

	var statsInfoFieldVal = pageCharacterDetailsView.getStatsInfoFieldValue();
	let expectedMessageThere = (statsInfoFieldVal.indexOf(SET_CHARDETAILS_PROMPT_MESSAGE) !== -1);
	assert.notOk(callbacked, 'Ensure the character details confirmed callback is not called.');
	assert.ok(expectedMessageThere, 'Check we prompt for character details if they are not set');
});

QUnit.test(TEST_TAG + 'checkCharacterDetails_characterSet', function (assert) {
	// Clear the session character
	pageController.characterDetails = new CharacterDetails();
	var characterDetails = pageController.characterDetails;
	assert.deepEqual(DEFAULT_CHARACTERDETAILS, characterDetails, 'Check character details have not been set for the Session.');

	// Set some Sesstion data
	pageController.characterDetails.setCharacterDetails(TEST_CHARDATA);
	characterDetails = pageController.characterDetails;
	assert.ok((characterDetails !== undefined && characterDetails !== null && characterDetails !== {}), 'Check some character details are set.');

	// Ask the character details model if all details exist
  let characterDetailsExist = pageController.characterDetails.characterDetailsExist();
	assert.ok(characterDetailsExist, 'Check all character details have been set for the Session.');

	var callbacked = false;
	// Create a new instance to assert the callback
	let characterDetailsConfirmedCallback = function () {
		callbacked = true;
	};

	// Try calling with our character details set.
	pageController.checkCharacterDetails(characterDetailsConfirmedCallback);
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

QUnit.test(TEST_TAG + 'handleCharacterUpdateResponse_noData', function (assert) {
	let messageData = {};
	let expectedMessage = '';

	// 1. No data
	let badDataError = new RangeError(INVALID_JSON_CHARACTER_UPDATE);
	try {
		pageController.handleCharacterUpdateResponse(messageData);
	} catch (err) {
		assert.deepEqual(err, badDataError, 'Ensure the correct RangeError is thrown if no character update data is returned.');
	}

	assert.expect(2);
});

QUnit.test(TEST_TAG + 'handleCharacterUpdateResponse_failed', function (assert) {
	let badDataError = new RangeError(INVALID_JSON_CHARACTER_UPDATE);

	// Invalid data
	let messageData = { success: false };
	let expectedMessage = '';
	pageCharacterDetailsView.clearStatsInfoField();
	// no char-data attrib
	try {
		pageController.handleCharacterUpdateResponse(messageData);
	} catch (err) {
		assert.deepEqual(err, badDataError, 'Ensure the correct RangeError is thrown if bad character update data is returned.');
	}

	// 3. Valid data but Update failed
	pageCharacterDetailsView.clearStatsInfoField();
	messageData =	JSON.parse(JSON.stringify(TEST_CHARUPDATE_DATA));
	messageData.success = false;
	expectedMessage = serverContextTag + CHARACTER_UPDATE_FAILURE_MESSAGE + '\n';
	pageController.handleCharacterUpdateResponse(messageData);
	assert.equal(pageCharacterDetailsView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update failed if the response says so.');

	// +1 expectation for this assertion
	assert.expect(3);
});


QUnit.test(TEST_TAG + 'handleCharacterUpdateResponse_success', function (assert) {
	pageCharacterDetailsView.clearStatsInfoField();
	let expectedMessage = serverContextTag + CHARACTER_UPDATE_SUCCESS_MESSAGE + '\n';
	pageController.handleCharacterUpdateResponse(TEST_CHARUPDATE_DATA);
	assert.equal(pageCharacterDetailsView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update success if the response says so.');
});

QUnit.test(TEST_TAG + 'saveCharacterData', function (assert) {
	// var stats = pageCharacterDetailsView.getStats ();
	var expectedStats = {'charname': TEST_CHARDATA.charname,
		'charclass': TEST_CHARDATA.charclass,
		'attributes': TEST_CHARDATA.scores};

	// 1. Valid update
	pageCharacterDetailsView.clearStatsInfoField();
	assert.ok(pageController.saveCharacterData(TEST_CHARDATA), 'Ensure we can save our test char data.');
	let stats = pageCharacterDetailsView.getStats();
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
	assert.ok(jquery(pageChatView.getPasswordInputFieldJquery()).is(':visible'), 'Check the password field is showing');

	assert.ok(pageChatView.getMessageLogValue().startsWith('Creating a new user, please enter a password for it: '), 'Check pwd request message.');

	// Check we're set to send a password on keyup
	//let messageInputEvents = jquery._data(pageChatView.getMessageInputField(), 'events');
	let keyupBinding = jQueryUtils.extractFirstJqueryBinding(pageChatView.getMessageInputField(), 'keyup');
	//assert.equal(messageInputEvents['keyup'][0].handler, pageController.passwordFieldKeyupTrigger, 'Check password sending on key-up is bound.');
	assert.equal(keyupBinding, pageController.passwordFieldKeyupTrigger, 'Check password sending on key-up is bound.');

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
	var clickBinding = jQueryUtils.extractFirstJqueryBinding(mainWindowDomElem, 'click');
	assert.equal(clickBinding, expectedBinding, 'Check when binding our expected function is bound for stage click.');

	// Disabled / Unbind
	pageController.bindStageClick(false);
	var clickBinding = jQueryUtils.extractFirstJqueryBinding(mainWindowDomElem, 'click');
	assert.equal(undefined, clickBinding, 'Check unbinding clears the click handler.');
});

QUnit.test(TEST_TAG + 'disableUI', function (assert) {
	pageController.enableUI();
	assert.ok(pageController.uiEnabled, 'UI Should be enabled before attempting disable.');
	pageController.disableUI();

	// Check page click has been unbound
	pageController.bindStageClick(false);
	var mainWindowDomElem = pageView.getMainWindowJquery()[0];
	var clickBinding = jQueryUtils.extractFirstJqueryBinding(mainWindowDomElem, 'click');
	assert.equal(undefined, clickBinding, 'Check unbinding clears the click handler.');
	
	assert.notOk(pageController.uiEnabled, 'UI Should be disabled now.');
});

QUnit.test(TEST_TAG + 'enableUI', function (assert) {
	assert.notOk(pageController.isUIEnabled(), 'UI Should be disabled before attempting enable.');
	pageController.enableUI();
	assert.ok(pageController.isUIEnabled(), 'UI Should be enabled now.');

	// Check page click has been bound
	//var expectedBinding = PixiController.stageClicked;
	//var mainWindowDomElem = pageView.getMainWindowJquery()[0];
	//pageController.bindStageClick(true, expectedBinding);

	// Using undocumented jQuery _data for events
	// to check first click handler
	var saveStatsButton = pageCharacterDetailsView.getSaveStatsButton();

	//let mappings = pageCharacterDetailsView.getMappings(pageStatsEvents.SAVE_STATS);

	var saveClickBinding = jQueryUtils.extractFirstJqueryBinding(saveStatsButton, 'click');
	assert.equal(saveClickBinding, pageController.sendCharDetails, 'Check our sendCharDetails func is bound to the button.');

	// Extract jQuery events
	var events = jquery._data(saveStatsButton, 'events');
	console.log(events);
	assert.equal(events['click'][0].handler, pageController.sendCharDetails, 'Check our sendCharDetails func is bound to the button.');

	var messageInputField = pageChatView.getMessageInputField();
	var messageInputEvents = jquery._data(messageInputField, 'events');
	assert.equal(messageInputEvents['keyup'][0].handler, pageController.messageFieldKeyupTrigger, 'Check message field sending on key-up is bound.');
	
});
