import ArrayHelper from 'src/helper/ArrayHelper.js';
import MapTile from 'src/model/pixi/map/MapTile.js';

var TEST_TAG = '|ATLAS-HELPER|';
var TEST_TILECOUNT = 20;

function beforeAll (assert) {
	// DO SOME STUFF
}

function beforeEachTest (assert) {
	// DO SOME STUFF
}

// Hookup before each test setup / assertion
QUnit.module('ArrayHelperTests', { before: beforeAll, beforeEach: beforeEachTest });

// Check our helper can build plain 2D arrays
QUnit.test(
TEST_TAG + 'create2dArray-vanilla-array', function (assert) {
	let testArray = ArrayHelper.create2dArray(TEST_TILECOUNT, TEST_TILECOUNT);

	assert.ok(testArray instanceof Array, 'Check the array is really an Array');
	assert.equal(testArray.length, TEST_TILECOUNT, 'Check array 1d size.');

	// Check the sub-arrays for 2D size validation
	for (let i = 0; (i < TEST_TILECOUNT); i++) {
		assert.ok(testArray instanceof Array, 'Check 1D arrays are initialised.');
		assert.equal(testArray[i].length, TEST_TILECOUNT);
	}
});

// Check our helper will initialise the array
// Using our passed in init func
// O(n) because we need to be sure we're initialising
QUnit.test(
TEST_TAG + 'create2dArray-initfunc-array', function (assert) {
	let testArray = ArrayHelper.create2dArray(TEST_TILECOUNT, TEST_TILECOUNT, MapTile);

	assert.ok(testArray instanceof Array, 'Check the array is really an Array');
	assert.equal(testArray.length, TEST_TILECOUNT, 'Check Array 1d depth');

	// Check the sub-arrays for 2D size validation
	let depthCount = 0
	let targetsValid = 0;
	let expectedValid = TEST_TILECOUNT * TEST_TILECOUNT;
	for (var x = 0; (x < TEST_TILECOUNT); x++) {
		if (testArray[x].length === TEST_TILECOUNT) {
			depthCount++;
		}
		for (var y = 0; (y < TEST_TILECOUNT); y++) {
			let target = testArray[x][y];
			// Increment a count 
			// instead of printing tons of assertion messages
			if (target !== null && target !== undefined && target instanceof MapTile) {
				targetsValid++;
			}
		}
	}
	assert.equal(depthCount, TEST_TILECOUNT, 'Check Array 2D depth is valid');
	assert.equal(targetsValid, expectedValid, 'Check Array contains enough MapTile instances');
});
