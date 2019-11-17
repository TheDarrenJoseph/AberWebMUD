import { CharacterDetailsBuilder } from 'src/model/page/CharacterDetailsBuilder.js';
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
QUnit.module('CharacterDetailsBuilderTests', { before: beforeAll, beforeEach: beforeEachTest, afterEach: afterEachTest }, () => {

	QUnit.test('Test Defaults', function (assert) {
		let testCharacterDetails = new CharacterDetailsBuilder().withDefaults()
		.build();

		assert.equal(testCharacterDetails.getAttributeScores().getFreePoints(), 0);
		assert.deepEqual(testCharacterDetails.getAttributeScores().getScoresJson(), {});
		assert.deepEqual(testCharacterDetails.getPosition(), [0, 0]);
		assert.equal(testCharacterDetails.getHealth(), 0);
		assert.deepEqual(testCharacterDetails.getCharacterClassOptions(), []);
		assert.notOk(testCharacterDetails.getCharacterName(), undefined, 'Expect no character name');
		assert.notOk(testCharacterDetails.getCharacterClass(), undefined, 'Expect no character class');
	});

	QUnit.test('Test Building', function (assert) {
		let testCharacterDetails = new CharacterDetailsBuilder().withDefaults()
		.withFreePoints(TestCharacterDetails.TEST_FREEPOINTS)
		.withScoreBoundaries(0, 100)
		.withPosition(4, 4)
		.withAttributeScores(TestCharacterDetails.TEST_SCORES)
		.withCharacterName(TestCharacterDetails.TEST_CHARNAME)
		.withCharacterClassOptions(TestCharacterDetails.TEST_CHARCLASS_OPTIONS)
		.withCharacterClass(TestCharacterDetails.TEST_CHARCLASS)
		.build();

		assert.equal(testCharacterDetails.getAttributeScores().getFreePoints(), TestCharacterDetails.TEST_FREEPOINTS, 'Check the expected free points are set')
		assert.deepEqual(testCharacterDetails.getPosition(), [4, 4])
		assert.equal(testCharacterDetails.getHealth(), 0)
		assert.deepEqual(testCharacterDetails.getAttributeScores().getScoresJson(), TestCharacterDetails.TEST_SCORES)
		assert.equal(testCharacterDetails.getCharacterName(), TestCharacterDetails.TEST_CHARNAME)
		assert.equal(testCharacterDetails.getCharacterClassOptions(), TestCharacterDetails.TEST_CHARCLASS_OPTIONS)
		assert.equal(testCharacterDetails.getCharacterClass(), TestCharacterDetails.TEST_CHARCLASS)
	});

});



