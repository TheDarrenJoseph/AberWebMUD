import EventMapping from 'src/helper/EventMapping.js';

var TEST_TAG = '|EVENT-MAPPING|';
var TEST_TILECOUNT = 20;

var TEST_EVENT_NAME = 'HELLO';
var TEST_EVENT_DATA = 'World';

var EVENTS = { HELLO : TEST_EVENT_NAME};

var eventTester;
class EventTester extends EventMapping {
	constructor (){
		super(EVENTS);
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
TEST_TAG + 'testMapping_noData_multiple', function (assert) {

	let helloDone = assert.async(1);
	let helloDone2 = assert.async(1);

	eventTester.on(TEST_EVENT_NAME,helloDone);
	eventTester.on(TEST_EVENT_NAME,helloDone2);
	eventTester.emit(TEST_EVENT_NAME);
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

QUnit.test(
TEST_TAG + 'testMapping_on_unsupported_event', function (assert) {
	assert.throws(() => { eventTester.on('BANANA', () => {}) },
	RangeError,
	'Ensure trying to on map to an unsupported event throws a RangeError'
	);
});

QUnit.test(
TEST_TAG + 'testMapping_on_unsupported_event', function (assert) {
	assert.throws(() => { eventTester.once('BANANA', () => {}) },
	RangeError,
	'Ensure trying to once map to an unsupported event throws a RangeError'
	);
});