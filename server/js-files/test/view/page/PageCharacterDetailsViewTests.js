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
import { EVENTS as pageStatsEvents, SET_CHARDETAILS_PROMPT_MESSAGE, PageCharacterDetailsView } from 'src/view/page/PageCharacterDetailsView.js';
import { PageView } from 'src/view/page/PageView.js';
import { CharacterDetails, DEFAULT_JSON } from 'src/model/page/CharacterDetails.js'


var TEST_TAG = '|PAGE CHARACTER-DETAILS VIEW|';

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
	assert.ok(pageCharacterDetailsView instanceof PageCharacterDetailsView, 'Ensure the character details view is instanciated.');
}

function afterEachTest (assert) {
	// Be sure the view is destroyed
	pageCharacterDetailsView.destroyView();
}

// Hookup before each test setup / assertion
QUnit.module('PageCharacterDetailsTests', { before: beforeAll, beforeEach: beforeEachTest, afterEach: afterEachTest });

QUnit.test(TEST_TAG + 'buildView', function (assert) {

	// Check the view is not built yet

	assert.throws( pageCharacterDetailsView.getStatsWindow(),
	Error,
	'Grabbing Stats window should fail if view is not built');

	assert.throws( pageCharacterDetailsView.getStatsForm(),
	Error,
	'Grabbing Stats form should fail if view is not built');

	pageCharacterDetailsView.buildView();

	assert.ok(pageCharacterDetailsView.getStatsWindow() instanceof Element, 'Check the Stats window is now instanciated.');
	assert.ok(pageCharacterDetailsView.getStatsForm() instanceof Element, 'Check the Stats form is now instanciated.');
});

/**
 * Given that the character details view has emitting setup
 * When the save stats button is clicked
 * Then we should emit an event for submitting these stats
 * And this should contain valid stat data
 */
QUnit.test(TEST_TAG + 'Setting Character Details Emitting', function (assert) {
	// This can be a little slow so it's best to allow a long wait
	assert.timeout(10000);

	let submissionCallback = assert.async(1);
	function submitStats(data) {
		assert.ok(pageCharacterDetailsView.characterDetails.isValidStats(data), 'Double-check the data returned is valid with the underlying model.');
		console.log('Test details submitted: ' + data);
		submissionCallback();
	}


	// Ensure we have some valid data in the view fields
	pageCharacterDetailsView.setStatsFromJsonResponse(TEST_CHARDATA);

	// Bind to the testing func
	pageCharacterDetailsView.on(pageStatsEvents.SUBMIT_STATS, submitStats);

	// Enable emitting
	pageCharacterDetailsView.setupEmitting();
	pageCharacterDetailsView.getSaveStatsButton().click();
});

/**
 * Given that the character details view is bound to it's model
 * When the CharacterDetails are set
 * Then we should show these values in our view
 */
QUnit.test(TEST_TAG + 'Setting Character Details View Update', function (assert) {
	let currentStats = pageCharacterDetailsView.characterDetails.getCharacterDetailsJson();
	assert.deepEqual(currentStats, DEFAULT_JSON, 'Check character details are their defaults in the view.')

	pageCharacterDetailsView.on(pageStatsEvents.STATS_SET, statsSet)

	// Perform the update of the underlying model
	pageCharacterDetailsView.characterDetails.setCharacterDetails(TEST_CHARDATA);

	let statsSetCallback = assert.async(1);
	function statsSet() {
		currentStats = pageCharacterDetailsView.characterDetails.getCharacterDetailsJson();
		assert.deepEqual(currentStats, TEST_CHARDATA, 'Check character details are updated in the view.');
		console.log('Test stats set in view.');
		statsSetCallback();
	}
});