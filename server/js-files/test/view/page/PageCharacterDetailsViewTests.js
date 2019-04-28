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
import { PageView } from 'src/view/page/PageView.js';
import { CharacterDetails, DEFAULT_JSON } from 'src/model/page/CharacterDetails.js'


var TEST_TAG = '|PAGE CHARACTER-DETAILS VIEW|';

var pageView;
var pageCharacterDetailsView;

var TEST_DOCUMENT = document;

// Unmodified char details for reference
var DEFAULT_CHARACTERDETAILS = new CharacterDetails();

// View based events can be a little sluggish
// These should take < 10s realistically but view init seems slow
let MAX_TIMEOUT = 10000;

// Setup / assertions before any test runs
function beforeAll (assert) {
	var pageModel = new Page(TEST_DOCUMENT);
	pageView = new PageView(pageModel);
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	pageCharacterDetailsView = new PageCharacterDetailsView(pageView, new CharacterDetails());
	assert.ok(pageCharacterDetailsView instanceof PageCharacterDetailsView, 'Ensure the character details view is instanciated.');
	pageView.buildView();
	pageCharacterDetailsView.buildView();
	pageCharacterDetailsView.bindEvents();
}

function afterEachTest (assert) {
	// Be sure the view is destroyed
	pageCharacterDetailsView.destroyView();
	pageView.destroyView();
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
	assert.timeout(MAX_TIMEOUT);

	// This async callback proves the stats are being submitted
	let submissionCallback = assert.async(1);
	function statsSubmitted(data) {
		assert.ok(CharacterDetails.isValidCharacterData(data), 'Double-check the data returned is valid with the underlying model.');
		console.log('Test details submitted: ' + JSON.stringify(data));
		submissionCallback();
	}

	// Ensure we have some valid data in the view fields
	pageCharacterDetailsView.setStatsFromJsonResponse(TEST_CHARDATA);

	// Bind to the testing func
	pageCharacterDetailsView.on(pageCharacterDetailsViewEvents.SUBMIT_STATS, statsSubmitted);

	// Enable emitting
	pageCharacterDetailsView.setupEmitting();
	pageCharacterDetailsView.getSaveStatsButtonJquery().trigger('click');
});

/**
 * Given that the character details view is bound to it's model
 * When the CharacterDetails model is set
 * Then view should automatically update to show these values
 */
QUnit.test(TEST_TAG + 'Setting Character Details View Update', function (assert) {
	assert.timeout(MAX_TIMEOUT);

	let currentStats = pageCharacterDetailsView.characterDetails.getCharacterDetailsJson();
	assert.deepEqual(currentStats, DEFAULT_JSON, 'Check character details are their defaults in the view.')

	let statsSetCallback = assert.async(1);
	function checkStats() {
		currentStats = pageCharacterDetailsView.characterDetails.getCharacterDetailsJson();
		assert.deepEqual(currentStats, TEST_CHARDATA, 'Check character details are updated in the view.');
		console.log('Test stats set in view.');
		statsSetCallback();
	}

	// Add an extra binding for when the set event is emitted
	pageCharacterDetailsView.on(pageCharacterDetailsViewEvents.VIEW_STATS_SET, checkStats)

	// Perform the update of the underlying model
	pageCharacterDetailsView.characterDetails.setCharacterDetails(TEST_CHARDATA);
});