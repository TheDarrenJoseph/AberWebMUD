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

	// This comparison kind of sucks but it's the clearest way to compare against the custom List type
	assert.ok(testOptions instanceof CharacterClassOptions, 'Check the object instanciated.');
	assert.equal(2, testOptions.length, 'Expect 2 entries');
	assert.equal(testOptions[0].id, "fighter", 'Check entry id');
	assert.equal(testOptions[0].text, "Fighter", 'Check entry text');
	assert.equal(testOptions[1].id, "spellcaster", 'Check entry id');
	assert.equal(testOptions[1].text, "Spellcaster", 'Check entry text');

});






