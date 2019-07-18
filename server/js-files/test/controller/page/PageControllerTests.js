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
import { EVENTS as pageCharacterDetailsViewEvents, SET_CHARDETAILS_PROMPT_MESSAGE, PageCharacterDetailsView } from 'src/view/page/PageCharacterDetailsView.js';
import { EVENTS as pageChatEvents, PageChatView } from 'src/view/page/PageChatView.js';
import { CLASS_OPTIONS } from 'src/model/page/CharacterDetails.js';
import { INVALID_USERNAME_MSG } from 'src/model/Player.js';
import { PageView } from 'src/view/page/PageView.js';
import { EVENTS as characterDetailsEvents, CharacterDetails } from 'src/model/page/CharacterDetails.js';

var TEST_TAG = '|PAGE CONTROLLER|';

var pageView;
var pageController;
var pageCharacterDetailsView;
var pageChatView;

var serverContextTag;

var TEST_WINDOW;
var TEST_DOCUMENT;

// Unmodified char details for reference
const DEFAULT_CHARACTERDETAILS = new CharacterDetails();

// Setup / assertions before any test runs
function beforeAll (assert) {
	TEST_WINDOW = window.open('', TEST_TAG, "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes")
	TEST_DOCUMENT = TEST_WINDOW.document;
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	// Make sure we have a fresh controller every time
	// To prevent knock-on state changes
	var pageModel = new Page(TEST_DOCUMENT);
	pageView = new PageView(pageModel);

	var charDets = new CharacterDetails();
	pageCharacterDetailsView = new PageCharacterDetailsView(pageView, charDets);
	pageChatView = new PageChatView(pageView);

	pageController = new PageController(TEST_DOCUMENT, pageView, pageCharacterDetailsView, pageChatView);
	// Perform Document based (HTML Elements, etc) setup
	pageController.setupUI();

	serverContextTag = pageChatView.getContextTagString('server')
	assert.ok(pageController instanceof PageController, 'Check controller instance is instanciated.');
}

function tearDown () {
	TEST_WINDOW.close();
}

// Hookup before each test setup / assertion
QUnit.module('PageContollerTests', { before: beforeAll, beforeEach: beforeEachTest, after: tearDown });

QUnit.test(TEST_TAG + 'setupUI', function (assert) {
	pageView.destroyView();
	assert.equal(pageView.getMainWindowJquery().length, 0, 'Check main window does not exist');
	pageController.setupUI();
	assert.equal(pageView.getMainWindowJquery().length, 1, 'Check main window exists');
});

QUnit.test(TEST_TAG + 'onceCharacterDetailsSet', function (assert) {
	// Clear the session character
	pageController.characterDetails = new CharacterDetails();
	var characterDetails = pageController.characterDetails;
	assert.deepEqual(DEFAULT_CHARACTERDETAILS, characterDetails, 'Check character details are their default values.');

	// this must be called for this test to pass
	let onConfirmCb = assert.async(1);
	pageController.onceCharacterDetailsSet(onConfirmCb);

	pageController.characterDetails.setCharacterDetails(TEST_CHARDATA);
	characterDetails = pageController.characterDetails;
	assert.ok((characterDetails !== undefined && characterDetails !== null && characterDetails !== {}), 'Check some character details are set.');

	// Ask the character details model if all details exist
  let characterDetailsExist = pageController.characterDetails.characterDetailsExist();
	assert.ok(characterDetailsExist, 'Check all character details have been set for the Session.');
});

QUnit.test(TEST_TAG + 'handlePlayerLoginError_blankJSON', function (assert) {
	assert.throws ( () => {
		pageController.handlePlayerLoginError({});
	},
	RangeError,
	'Check blank server data JSON throws a validation RangeError');
});

QUnit.test(TEST_TAG + 'handlePlayerLoginError_badPassword', function (assert) {
	// Otherwise you'll get a password error
	pageChatView.clearMessageLog();
	let serverData = { 'playerExists' : true };
	let expectedMessage = serverContextTag + LOGIN_FAILURE_MESSAGE_PWD + '\n';
	pageController.handlePlayerLoginError(serverData);
	assert.equal(pageChatView.getMessageLogValue(), expectedMessage);
});

QUnit.test(TEST_TAG + 'handleCharacterUpdateResponse_blankJSON', function (assert) {
	assert.throws( () => {
		pageController.handleCharacterUpdateResponse({});
	}, RangeError,
	'Ensure a RangeError is thrown if no character update data is returned.');
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

	//assert.equal(pageCharacterDetailsView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update failed if the response says so.');
	var statsInfoFieldVal = pageCharacterDetailsView.getStatsInfoFieldValue();
	let failureMessageThere = (statsInfoFieldVal.indexOf(expectedMessage) !== -1);
	let promptMessageThere = (statsInfoFieldVal.indexOf(SET_CHARDETAILS_PROMPT_MESSAGE) !== -1);
	assert.ok(failureMessageThere, 'Check we alert the user that the details have failed to submit.');
	assert.ok(promptMessageThere, 'Check we prompt for character details on a failure.');

	// +1 expectation for this assertion
	assert.expect(4);
});


QUnit.test(TEST_TAG + 'handleCharacterUpdateResponse_success', function (assert) {
	pageCharacterDetailsView.clearStatsInfoField();
	let expectedMessage = serverContextTag + CHARACTER_UPDATE_SUCCESS_MESSAGE + '\n';
	pageController.handleCharacterUpdateResponse(TEST_CHARUPDATE_DATA);
	assert.equal(pageCharacterDetailsView.getStatsInfoFieldValue(), expectedMessage, 'Check we log update success if the response says so.');
});

QUnit.test(TEST_TAG + 'saveCharacterData', function (assert) {
	// 1. Valid update
	pageCharacterDetailsView.clearStatsInfoField();
	assert.ok(pageController.saveCharacterData(TEST_CHARDATA), 'Ensure we can save our test char data.');
	let stats = pageCharacterDetailsView.characterDetails.getCharacterDetailsJson();
	assert.deepEqual(stats, TEST_CHARDATA, 'Check our stats are set as expected');

	// 2. Bad data
	// Copy the original and modify
	var badResponse = {'charname': 'roo', 'pos_x': 10, 'pos_y': 10, 'health': 100, 'charclass': 'fighter', 'free_points': 5, 'attributes': {}};
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

QUnit.test(TEST_TAG + 'requestUserPassword_good', function (assert) {
	pageController.enableUI();
	assert.ok(pageController.uiEnabled, 'UI Should be enabled before requesting user password.');

	let PROMPT = 'Creating a new user, please enter a password for it: ';

	// 1. Username and prompt is given
	pageController.requestUserPassword('test', PROMPT);
	assert.ok(jquery(pageChatView.getPasswordInputFieldJquery()).is(':visible'), 'Check the password field is showing');
	assert.ok(pageChatView.getMessageLogValue().startsWith(PROMPT), 'Check pwd request message.');

	let keyupBinding = jQueryUtils.extractFirstJqueryBinding(pageChatView.getMessageInputField(), 'keyup');
	assert.ok(keyupBinding instanceof Function, 'Check message input keyup is bound to a Function');
});

QUnit.test(TEST_TAG + 'requestUserPassword_bad', function (assert) {
	pageController.enableUI();
	assert.ok(pageController.uiEnabled, 'UI Should be enabled before requesting user password.');

	// 1. Username is given, no prompt
	assert.throws(() => { pageController.requestUserPassword('test')},
	RangeError, 'A missing prompt message should throw a range Error');

	// 1. Bad username, with prompt
	// No error thrown but we will be prompted about it.
	let PROMPT = 'Creating a new user, please enter a password for it: ';
	pageController.requestUserPassword('', PROMPT);
	assert.ok(jquery(pageChatView.getPasswordInputFieldJquery()).is(':visible'), 'Check the password field is showing');
	assert.ok(pageChatView.getMessageLogValue().startsWith(INVALID_USERNAME_MSG), 'Check pwd request message.');

});

QUnit.test(TEST_TAG + 'disableUI', function (assert) {
	pageController.enableUI();
	assert.ok(pageController.uiEnabled, 'UI Should be enabled before attempting disable.');
	pageController.disableUI();

	// Check page click has been unbound
	//pageController.bindStageClick(false);
	var mainWindowDomElem = pageView.getMainWindowJquery()[0];
	var clickBinding = jQueryUtils.extractFirstJqueryBinding(mainWindowDomElem, 'click');
	assert.equal(undefined, clickBinding, 'Check this clears the click handler.');

	assert.notOk(pageController.uiEnabled, 'UI Should be disabled now.');
});

/**
 * Test individual UI Elements get constructed / setup
 */
QUnit.test(TEST_TAG + 'enableUI_setup', function (assert) {
	assert.notOk(pageController.isUIEnabled(), 'UI Should be disabled before attempting enable.');
	pageController.enableUI();
	assert.ok(pageController.isUIEnabled(), 'UI Should be enabled now.');

	assert.ok(pageController.pageView instanceof PageView, 'Check PageView is instanciated.');
	assert.ok(pageController.getPageCharacterDetailsView() instanceof PageCharacterDetailsView, 'Check PageCharacterDetailsView is instanciated.');
	assert.ok(pageController.getPageChatView() instanceof PageChatView, 'Check PageChatView is instanciated.');
});


QUnit.test(TEST_TAG + 'enableUI_bindings', function (assert) {
	assert.notOk(pageController.isUIEnabled(), 'UI Should be disabled before attempting enable.');
	let sendMessageMappings = pageController.getPageChatView().getMappings(pageChatEvents.SEND_MESSAGE);
	assert.equal(sendMessageMappings.length, 0, 'Check nothing is bound to SEND_MESSAGE');
	let submitStatsMappings = pageController.getPageChatView().getMappings(pageChatEvents.SEND_MESSAGE);
	assert.equal(submitStatsMappings.length, 0, 'Check nothing is bound to SUBMIT_STATS');

	pageController.enableUI();
	assert.ok(pageController.isUIEnabled(), 'UI Should be enabled now.');

	// Asserting count is a bit silly but not sure how to assert anon functions yet
	sendMessageMappings = pageController.getPageChatView().getMappings(pageChatEvents.SEND_MESSAGE);
	assert.equal(sendMessageMappings.length, 1, 'Check something is bound to SEND_MESSAGE');
	submitStatsMappings = pageController.getPageChatView().getMappings(pageChatEvents.SEND_MESSAGE);
	assert.equal(submitStatsMappings.length, 1, 'Check something is bound to SUBMIT_STATS');
});
