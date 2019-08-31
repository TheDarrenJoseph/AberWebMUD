import { CharacterDetails } from 'src/model/page/CharacterDetails.js';
import * as TestCharacterDetails from 'test/utils/data/TestCharacterDetails.js';

// Setup / assertions before any test runs
function beforeAll (assert) {
}

// Setup / assertions before each test
function beforeEachTest (assert) {
}

function afterEachTest (assert) {
}

// Hookup before each test setup / assertion
QUnit.module('CharacterDetailsBuilderTests', { before: beforeAll, beforeEach: beforeEachTest, afterEach: afterEachTest });

QUnit.test('Testing JSON format', function (assert) {
	let testCharacterDetails = new CharacterDetails(TestCharacterDetails.TEST_CHARCLASS_OPTIONS,
	TestCharacterDetails.TEST_SCORES,
	0, 100, //Score boundaries
	4, 4, // Position
	100, //Health
	TestCharacterDetails.TEST_FREEPOINTS);

	testCharacterDetails.setCharacterName(TestCharacterDetails.TEST_CHARNAME);
	testCharacterDetails.setCharacterClass(TestCharacterDetails.TEST_CHARCLASS);

	assert.equal(testCharacterDetails.getAttributeScores().getFreePoints(), TestCharacterDetails.TEST_FREEPOINTS, 'Check the expected free points are set')
	assert.deepEqual(testCharacterDetails.getPosition(), [4,4])
	assert.equal(testCharacterDetails.getHealth(), 100)
	assert.deepEqual(testCharacterDetails.getAttributeScores().getScoresJson(), TestCharacterDetails.TEST_SCORES)
	assert.equal(testCharacterDetails.getCharacterName(), TestCharacterDetails.TEST_CHARNAME)
	assert.equal(testCharacterDetails.getCharacterClassOptions(), TestCharacterDetails.TEST_CHARCLASS_OPTIONS)
	assert.equal(testCharacterDetails.getCharacterClass(), TestCharacterDetails.TEST_CHARCLASS)

	let realJson = testCharacterDetails.getJson()
	assert.deepEqual(realJson, TestCharacterDetails.TEST_CHARDATA, 'Ensure the JSON representation is as expected.')
});





