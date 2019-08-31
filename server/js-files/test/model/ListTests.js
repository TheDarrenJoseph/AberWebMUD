
import { List } from 'src/model/List.js'

var TEST_TAG = '|ARRAY-LIST-TESTS|'

// Setup / assertions before any test runs
function beforeAll (assert) {
}

// Setup / assertions before each test
function beforeEachTest (assert) {

}

function afterEachTest (assert) {

}

// Hookup before each test setup / assertion
QUnit.module('ListTests', { before: beforeAll, beforeEach: beforeEachTest, afterEach: afterEachTest });

QUnit.test(TEST_TAG + 'Storing some data', function (assert) {
	let list = new List();
	list.add('Hello');
	console.log(list)
	assert.equal(list.length, 1, 'Ensure the list size is correct');
	assert.equal(list.get(0), 'Hello', 'Ensure the list content correct');
});

QUnit.test(TEST_TAG + 'Removing some data', function (assert) {
	let testString = 'Hello';
	let list = new List();
	list.add(testString);
	assert.equal(list.length, 1, 'Ensure the list size is correct');
	assert.equal(list.get(0), 'Hello', 'Ensure the list content correct');

	list.remove(testString)
	assert.equal(list.length, 0, 'Ensure the element was removed');
});

QUnit.test(TEST_TAG + 'List from list', function (assert) {
	let list = List.from(['a','b'])
	assert.equal(list.length, 2, 'Ensure the list size is correct');
	assert.deepEqual(list, ['a','b'], 'Ensure the list contents are correct');
});
