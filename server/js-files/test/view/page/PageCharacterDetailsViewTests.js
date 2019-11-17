//const $ = require('jquery');
//import $ from 'libs/jquery.js';

//import jquery from 'jquery';
import jquery from '../../../libs/jquery-3.4.1.dev.js';

import { jQueryUtils } from '../../utils/jQueryUtils.js';

import { TEST_SESSIONID, TEST_CHARUPDATE_DATA } from '../..//utils/data/TestSessionData.js';
import { TEST_CHARACTER_CLASS_OPTIONS } from '../../utils/data/TestCharacterDetails.js';

import { PageController, LOGIN_FAILURE_MESSAGE_PWD,
	LOGIN_FAILURE_MESSAGE_PLAYER,
	INVALID_JSON_CHARACTER_UPDATE,
	INVALID_JSON_CHARACTER_DATA,
	CHARACTER_UPDATE_SUCCESS_MESSAGE,
	CHARACTER_UPDATE_FAILURE_MESSAGE,
	MOVEMENT_FAILURE_MESSAGE,
	INVALID_LOGIN_MESSAGE } from '../../../src/controller/page/PageController.js';
import { PixiController } from '../../../src/controller/pixi/PixiController.js';
import { Session } from '../../../src/model/Session.js';
import { Page } from '../../../src/model/page/Page.js';
import { EVENTS as pageCharacterDetailsViewEvents, SET_CHARDETAILS_PROMPT_MESSAGE, PageCharacterDetailsView } from '../../../src/view/page/PageCharacterDetailsView.js';
import { PageView } from '../../../src/view/page/PageView.js';
import { CharacterDetails } from '../../../src/model/page/CharacterDetails.js'
import { ArraySet } from '../../../src/model/ArraySet.js'
import { AttributeScores, MIN_VALUE_NAME, MAX_VALUE_NAME, FREEPOINTS_NAME, SCORES_NAME } from 'src/model/page/AttributeScores.js';
import { CharacterDetailsBuilder } from '../../../src/model/page/CharacterDetailsBuilder.js'

import * as TestCharacterDetails from '../../utils/data/TestCharacterDetails.js';
import { TEST_CHARCLASSOPTIONS } from '../../utils/data/TestCharacterDetails'
import * as TestWindow from '../../utils/TestWindow'

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

var TEST_DOCUMENT;
var TEST_WINDOW;

// View based events can be a little sluggish
// These should take < 10s realistically but view init seems slow
let MAX_TIMEOUT = 10000;

// Setup / assertions before any test runs
function beforeAll (assert) {
	TEST_WINDOW = TestWindow.buildTestWindow(TEST_TAG);
	TEST_DOCUMENT = TEST_WINDOW.document;
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
	// pageCharacterDetauisView will be re-instanciated
	// but we must destroy everything on the PageView above it
	pageView.destroyView();
}

function afterAll(assert) {
	//TEST_WINDOW.close();
}

// These are the expected values upon construction
const EXPECTED_DEFAULT_VIEW_JSON = {
	'charname' : '',
	'charclass': null,
	'attributes': {
		'free_points' : 0,
		'max_value' : 0,
		'min_value' : 0,
		'scores' : {}
	}
}

// Hookup before each test setup / assertion
QUnit.module('PageCharacterDetailsViewTests', { before: beforeAll, beforeEach: beforeEachTest, afterEach: afterEachTest, after: afterAll }, () => {

	QUnit.test(TEST_TAG + 'buildView', function (assert) {

		// Check the view is not built yet

		assert.throws(pageCharacterDetailsView.getStatsWindow(),
		Error,
		'Grabbing Stats window should fail if view is not built');

		assert.throws(pageCharacterDetailsView.getStatsForm(),
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

		function statsSubmitted (data) {
			assert.ok(CharacterDetails.validateJson(data), 'Double-check the data returned is valid with the underlying model.');
			console.log('Test details submitted: ' + JSON.stringify(data));
			submissionCallback();
		}

		let viewCharDetails = pageCharacterDetailsView.getCharacterDetails();

		// Ensure we have some character class options to select from
		viewCharDetails.setCharacterClassOptions(TestCharacterDetails.TEST_CHARCLASSOPTIONS)
		assertDefaultCharclassOptions(assert);

		// Ensure we have some valid data in the view fields
		// Update the underlying data model, this should update the view.
		let attributesJson = viewCharDetails.extractAttributesJson(TestCharacterDetails.TEST_CHARDATA);
		viewCharDetails.setAttributesFromJson(attributesJson);

		// Bind to the testing func
		pageCharacterDetailsView.on(pageCharacterDetailsViewEvents.SUBMIT_STATS, statsSubmitted);

		// Enable emitting
		pageCharacterDetailsView.setupEmitting();
		// Trigger the click handler
		pageCharacterDetailsView.getSaveStatsButtonJquery().trigger('click');
	});

	/**
	 * Checks the test page character details view's underlying character details match the expected testing default options
	 * In example: [ fighter, spellcaster ]
	 * @param assert qunit's assert object
	 */
	function assertDefaultCharclassOptions (assert) {
		let viewCharDetails = pageCharacterDetailsView.getCharacterDetails();
		// These are instances of Option, so have id/text attribs
		let charclassOptions = viewCharDetails.getCharacterClassOptions();
		assert.equal(2, charclassOptions.length, 'Make sure the underlying character data is updated with character class options.');
		assert.equal('fighter', charclassOptions[0].id, 'Make sure the underlying character data is updated with character class options.');
		assert.equal('spellcaster', charclassOptions[1].id, 'Make sure the underlying character data is updated with character class options.');
	}

	QUnit.test(TEST_TAG + 'Set View Character Class Options', function (assert) {
		assert.timeout(MAX_TIMEOUT);

		let currentStats = pageCharacterDetailsView.getJson();
		let viewCharDetails = pageCharacterDetailsView.getCharacterDetails();
		assert.deepEqual(currentStats, EXPECTED_DEFAULT_VIEW_JSON, 'Check character details are their defaults in the view.')
		// Add some potential class options
		viewCharDetails.setCharacterClassOptions(TestCharacterDetails.TEST_CHARCLASSOPTIONS)
		assertDefaultCharclassOptions(assert);

		viewCharDetails.setCharacterClass('Fighter');

		// Expect the same but with the character class set
		let expectedUpdatedJson = JSON.parse(JSON.stringify(EXPECTED_DEFAULT_VIEW_JSON));
		expectedUpdatedJson.charclass = 'Fighter';
		currentStats = pageCharacterDetailsView.getJson();
		assert.deepEqual(currentStats, expectedUpdatedJson, 'Make sure the view data is updated with the current character class..');
	});

	QUnit.test(TEST_TAG + 'Setting Charclass Options - View Update', function (assert) {
		assert.timeout(MAX_TIMEOUT);
		let currentStats = pageCharacterDetailsView.getJson();
		let viewCharDetails = pageCharacterDetailsView.getCharacterDetails();

		assert.deepEqual(currentStats, EXPECTED_DEFAULT_VIEW_JSON, 'Check character details are their defaults in the view.')

		const EXPECTED_JSON = {
			'charname': "",
			// The first set option will be selected automatically
			'charclass': TestCharacterDetails.TEST_CHARCLASSOPTIONS[0],
			'attributes': {
				'free_points': 0,
				'min_value': 0,
				'max_value': 0,
				'scores': {}
			}
		}

		// Test callback for VIEW_STATS_SET
		let charclassCallback = assert.async(1);

		function checkCharClassOptions () {
			assertDefaultCharclassOptions(assert);

			currentStats = pageCharacterDetailsView.getJson()
			assert.deepEqual(currentStats, EXPECTED_JSON, 'Check updated character details are displayed in the view.');
			console.log('Test stats set in view.');
			charclassCallback();
		}

		pageCharacterDetailsView.once(pageCharacterDetailsViewEvents.VIEW_CHARCLASSES_SET, checkCharClassOptions);

		viewCharDetails.setCharacterClassOptions(TestCharacterDetails.TEST_CHARCLASSOPTIONS);
	});

	/**
	 * Given that the character details view is bound to it's model
	 * When the CharacterDetails model is set
	 * Then view should automatically update to show these values
	 */
	QUnit.test(TEST_TAG + 'Setting Character Attributes - View Update', function (assert) {
		assert.timeout(MAX_TIMEOUT);
		let currentStats = pageCharacterDetailsView.getJson();
		assert.deepEqual(currentStats, EXPECTED_DEFAULT_VIEW_JSON, 'Check character details are their defaults in the view.')

		let attributesCallback = assert.async(1);

		function checkAttributes () {
			let expectedViewJson = {
				'charname': "",
				'charclass': null,
				'attributes': {
					'free_points': 5,
					'min_value': 0,
					'max_value': 100,
					'scores': TestCharacterDetails.TEST_SCORES
				}
			}
			currentStats = pageCharacterDetailsView.getJson()
			assert.deepEqual(currentStats, expectedViewJson, 'Check updated character details are displayed in the view.');
			console.log('Test stats set in view.');
			attributesCallback();
		}

		pageCharacterDetailsView.once(pageCharacterDetailsViewEvents.VIEW_ATTRIBUTES_SET, checkAttributes)
		// Set some standard returned attribute scores
		pageCharacterDetailsView.characterDetails.setAttributeScores(TestCharacterDetails.TEST_ATTRIBUTE_SCORES);
	});

	/**
	 * Given that the character details view is bound to it's model
	 * When the CharacterDetails model is set
	 * Then view should automatically update to show these values
	 */
	QUnit.test(TEST_TAG + 'Setting Character Details - View Update', function (assert) {
		assert.timeout(MAX_TIMEOUT);

		let currentStats = pageCharacterDetailsView.getJson();
		assert.deepEqual(currentStats, EXPECTED_DEFAULT_VIEW_JSON, 'Check character details are their defaults in the view.')

		// Ensure we have some character class options to select from
		pageCharacterDetailsView.characterDetails.setCharacterClassOptions(TestCharacterDetails.TEST_CHARCLASSOPTIONS)
		assertDefaultCharclassOptions(assert);

		let attributesCallback = assert.async(1);

		function checkAttributes () {
			let expectedViewJson = {
				'charname': TestCharacterDetails.TEST_CHARNAME,
				'charclass': TestCharacterDetails.TEST_CHARCLASS,
				'attributes': {
					'free_points': 5,
					'min_value': 0,
					'max_value': 100,
					'scores': TestCharacterDetails.TEST_SCORES
				}
			}
			currentStats = pageCharacterDetailsView.getJson()
			assert.deepEqual(currentStats, expectedViewJson, 'Check updated character details are displayed in the view.');
			console.log('Test stats set in view.');
			attributesCallback();
		}

		pageCharacterDetailsView.once(pageCharacterDetailsViewEvents.VIEW_STATS_SET, checkAttributes);

		let testJson = TestCharacterDetails.testCharacterDetails.getJson();
		pageCharacterDetailsView.characterDetails.setFromJson(testJson);
	});

});