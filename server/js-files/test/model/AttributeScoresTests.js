import { AttributeScores } from 'src/model/page/AttributeScores.js';
import { TEST_ATTRIBUTES_RESPONSE } from 'test/utils/data/TestCharacterDetails.js';

// Setup / assertions before any test runs
function beforeAll (assert) {
}

// Setup / assertions before each test
function beforeEachTest (assert) {
}

function afterEachTest (assert) {
}

// Hookup before each test setup / assertion
QUnit.module('AttributeScoresTests', { before: beforeAll, beforeEach: beforeEachTest, afterEach: afterEachTest });

QUnit.test('new AttributeScores', function (assert) {
	let scoresJson = {'Strength':1, 'Agility':1, 'Arcana' : 1, 'Stealth': 1};
	let minValue = 0;
	let maxValue = 100;
	let freePoints = 5;
	let attributeScores = new AttributeScores(scoresJson, minValue, maxValue, freePoints);
	assert.ok(attributeScores instanceof AttributeScores, 'Check our scores are instanciated');
	assert.equal(attributeScores.getMinimumAttributeValue(), minValue, 'Check minimum attribute value is set');
	assert.equal(attributeScores.getMaximumAttributeValue(), maxValue, 'Check maxmimum attribute value is set');
	assert.equal(attributeScores.getFreePoints(), freePoints, 'Check free points attribute value is set');
	assert.deepEqual(attributeScores.getScoresJson(), scoresJson, 'Check attribute scores have been set');
});


QUnit.test('fromJson', function (assert) {
	let attributeScores = AttributeScores.fromJson(TEST_ATTRIBUTES_RESPONSE);
	assert.ok(attributeScores instanceof AttributeScores, 'Check our scores are instanciated');
	assert.equal(attributeScores.getMinimumAttributeValue(), 0, 'Check minimum attribute value is set');
	assert.equal(attributeScores.getMaximumAttributeValue(), 100, 'Check maxmimum attribute value is set');
	assert.equal(attributeScores.getFreePoints(), 5, 'Check free points attribute value is set');
	assert.deepEqual(attributeScores.getScoresJson(), 	{'Strength':1, 'Agility':1, 'Arcana' : 1, 'Stealth': 1}, 'Check attribute scores have been set');
});



