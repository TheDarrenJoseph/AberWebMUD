import { CharacterClassOptions } from 'src/model/page/CharacterClassOptions.js';
import * as TestCharacterDetails from 'test/utils/data/TestCharacterDetails.js';
import { TEST_CHARCLASSOPTIONS } from '../../utils/data/TestCharacterDetails'

// Setup / assertions before any test runs
function beforeAll (assert) {
}

// Setup / assertions before each test
function beforeEachTest (assert) {
}

function afterEachTest (assert) {
}

// Hookup before each test setup / assertion
QUnit.module('CharacterClassOptionsTests', { before: beforeAll, beforeEach: beforeEachTest, afterEach: afterEachTest });

QUnit.test('new CharacterClassOptions', function (assert) {
	let testOptions = new CharacterClassOptions();
	assert.deepEqual(testOptions, []);
});

QUnit.test('fromOptionsList', function (assert) {
	let testOptions = CharacterClassOptions.fromOptionsList(['Fighter', 'Spellcaster']);
	assert.equal(testOptions, [
		{
			"id": "fighter",
			"text": "Fighter"
		},
		{
			"id": "spellcaster",
			"text": "Spellcaster"
		}
	]);
});






