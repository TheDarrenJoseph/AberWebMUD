//const $ = require('jquery');
//import $ from 'libs/jquery.js';

//import jquery from 'jquery';
import jquery from 'libs/jquery-3.4.1.dev.js';

import { jQueryUtils } from 'test/utils/jQueryUtils.js';

import { TEST_SESSIONID, TEST_CHARUPDATE_DATA } from 'test/utils/data/TestSessionData.js';
import { TEST_CHARACTER_CLASS_OPTIONS } from 'test/utils/data/TestCharacterDetails.js';

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
import { CharacterDetails } from 'src/model/page/CharacterDetails.js'
import { ArraySet } from 'src/model/ArraySet.js'
import { AttributeScores, MIN_VALUE_NAME, MAX_VALUE_NAME, FREEPOINTS_NAME, SCORES_NAME } from 'src/model/page/AttributeScores.js';
import { CharacterDetailsBuilder } from 'src/model/page/CharacterDetailsBuilder.js'

import * as TestCharacterDetails from 'test/utils/data/TestCharacterDetails.js';
import { TEST_CHARCLASSOPTIONS } from '../../utils/data/TestCharacterDetails'

export const DEFAULT_JSON = {
	'character' : {
		'charname': '',
		'charclass': '',
		'health': 0,
		'attributes': {
			[MIN_VALUE_NAME]: 0,
			[MAX_VALUE_NAME] : 0,
			[FREEPOINTS_NAME]: 0,
			[SCORES_NAME]: {}
		},
		'position': {
			'pos_x': 0,
			'pos_y': 0
		}
	}
};


var TEST_TAG = '|PAGE CHARACTER-DETAILS VIEW|';

var pageView;
var pageCharacterDetailsView;

var TEST_DOCUMENT = document;

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

	let detailsBuilder = new CharacterDetailsBuilder().withDefaults();
	pageCharacterDetailsView = new PageCharacterDetailsView(pageView, detailsBuilder.build());
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
QUnit.module('PageCharacterDetailsViewTests', { before: beforeAll, beforeEach: beforeEachTest, afterEach: afterEachTest });

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
QUnit.test(TEST_TAG + 'Setting Character Details - Emitting', function (assert) {
	assert.timeout(MAX_TIMEOUT);

	// This async callback proves the stats are being submitted
	let submissionCallback = assert.async(1);
	function statsSubmitted(data) {
		let charDetails = pageCharacterDetailsView.getCharacterDetails();
		assert.ok(CharacterDetails.validateJson(data), 'Double-check the data returned is valid with the underlying model.');
		console.log('Test details submitted: ' + JSON.stringify(data));
		submissionCallback();
	}

	// Ensure we have some valid data in the view fields
	// Update the underlying data model, this should update the view.
	pageCharacterDetailsView.getCharacterDetails().setFromJson(TestCharacterDetails.TEST_CHARDATA);

	// Bind to the testing func
	pageCharacterDetailsView.on(pageCharacterDetailsViewEvents.SUBMIT_STATS, statsSubmitted);

	// Enable emitting
	pageCharacterDetailsView.setupEmitting();
	pageCharacterDetailsView.getSaveStatsButtonJquery().trigger('click');
});


QUnit.test(TEST_TAG + 'Set Character Class Options', function (assert) {
	assert.timeout(MAX_TIMEOUT);

	let currentStats = pageCharacterDetailsView.getJson();
	let expectedViewDefaultJson = {
		'charname' : '',
		'charclass': null,
		'attributes': {
			'free_points' : 0,
			'scores' : {}
		}
	}
	assert.deepEqual(currentStats, expectedViewDefaultJson, 'Check character details are their defaults in the view.')

	pageCharacterDetailsView.characterDetails.setCharacterClassOptions(TestCharacterDetails.TEST_CHARCLASSOPTIONS)

	// Expect the same but with the character class set
	let expectedUpdatedJson = expectedViewDefaultJson;
	expectedUpdatedJson.charclass = 'Fighter';
	currentStats = pageCharacterDetailsView.getJson();
	assert.deepEqual(currentStats, expectedUpdatedJson, 'Make sure the view data is updated with the current character class..');

	// These are instances of Option, so have id/text attribs
	let charclassOptions = pageCharacterDetailsView.getCharacterDetails().getCharacterClassOptions();

	assert.equal(2, charclassOptions.length, 'Make sure the underlying character data is updated with character class options.');
	assert.equal('fighter', charclassOptions[0].id, 'Make sure the underlying character data is updated with character class options.');
	assert.equal('spellcaster', charclassOptions[1].id, 'Make sure the underlying character data is updated with character class options.');

});

/**
 * Given that the character details view is bound to it's model
 * When the CharacterDetails model is set
 * Then view should automatically update to show these values
 */
QUnit.test(TEST_TAG + 'Setting Character Details - View Update', function (assert) {
	assert.timeout(MAX_TIMEOUT);

	let currentStats = pageCharacterDetailsView.getJson();
	let expectedViewDefaultJson = {
		'charname' : '',
		'charclass': null,
		'attributes': {
			'free_points' : 0,
			'scores' : {}
		}
	}
	assert.deepEqual(currentStats, expectedViewDefaultJson, 'Check character details are their defaults in the view.')

	// Test callback for VIEW_STATS_SET
	let statsSetCallback = assert.async(1);
	function checkStats() {
		let expectedViewJson = {
			'charname' : TestCharacterDetails.TEST_CHARNAME,
			'charclass': TestCharacterDetails.TEST_CHARCLASS,
			'attributes': {
				'free_points' : 5,
				'scores' : TestCharacterDetails.TEST_SCORES
			}
		}
		currentStats = pageCharacterDetailsView.getJson()
		assert.deepEqual(currentStats, expectedViewJson, 'Check updated character details are displayed in the view.');
		console.log('Test stats set in view.');
		statsSetCallback();
	}

	// Add an extra binding for when the set event is emitted
	let testJson = TestCharacterDetails.testCharacterDetails.getJson();
	pageCharacterDetailsView.on(pageCharacterDetailsViewEvents.VIEW_STATS_SET, checkStats)
	// Ensure we have some options we can display
	pageCharacterDetailsView.characterDetails.setCharacterClassOptions(TestCharacterDetails.TEST_CHARCLASSOPTIONS);
	// Set some standard returned attribute scores
	pageCharacterDetailsView.characterDetails.setAttributeScores(TestCharacterDetails.TEST_ATTRIBUTE_SCORES);
	pageCharacterDetailsView.characterDetails.setFromJson(testJson);
});