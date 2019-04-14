import EventMapping from 'src/helper/EventMapping.js';

var TEST_TAG = '|EVENT-MAPPING|';
var TEST_TILECOUNT = 20;

var TEST_EVENT_NAME = 'HELLO';
var TEST_EVENT_DATA = 'World';

var eventTester;
class EventTester extends EventMapping {
	constructor (){
		super();
	}
}

function beforeAll (assert) {
	eventTester = new EventTester();
}

function beforeEachTest (assert) {
	eventTester.clearMappings();
	assert.deepEqual({}, eventTester.mappings, 'Ensure any mappings have been cleared.');
}

// Hookup before each test setup / assertion
QUnit.module('EventMappingTests', { before: beforeAll, beforeEach: beforeEachTest });

QUnit.test(
TEST_TAG + 'testMapping_noData', function (assert) {

	let helloDone = false;
	function hello() {
		helloDone = true;
	}

	// Bind
	eventTester.on(TEST_EVENT_NAME,hello);
	eventTester.emit(TEST_EVENT_NAME);

	assert.ok(helloDone, 'Ensure the callback was performed.');
});

QUnit.test(
TEST_TAG + 'testMapping_data', function (assert) {

	let helloDone = false;
	function hello(data) {
		assert.equal(data, TEST_EVENT_DATA, 'Check function called with test data');
		helloDone = true;
	}

	// Bind
	eventTester.on(TEST_EVENT_NAME,hello);
	eventTester.emit(TEST_EVENT_NAME, TEST_EVENT_DATA);

	assert.ok(helloDone, 'Ensure the callback was performed.');
});

QUnit.test(
TEST_TAG + 'testMapping_singleShot', function (assert) {

	let helloDone = false;
	function hello() {
		helloDone = true;
	}

	// Bind
	eventTester.once(TEST_EVENT_NAME,hello);
	eventTester.emit(TEST_EVENT_NAME);

	assert.ok(helloDone, 'Ensure the callback was performed.');

	// Reset helloDone
	helloDone = false;
	eventTester.emit(TEST_EVENT_NAME);
	assert.notOk(helloDone, 'Ensure the callback was not performed a second time.');
});