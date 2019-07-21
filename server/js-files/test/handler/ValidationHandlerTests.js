import ValidationHandler from 'src/handler/ValidationHandler.js';

var TEST_TAG = '|VALIDATION-HANDLER|';

const VALID_MOVEMENT_UPDATE = {
	'username': 'testy',
	'old_position': {
		'pos_x': 1,
		'pos_y': 1
	},
	'position': {
		'pos_x': 2,
		'pos_y': 2
	}
};

function beforeAll (assert) {
	// DO SOME STUFF
}

function beforeEachTest (assert) {
	// DO SOME STUFF
}

QUnit.module('ValidationHandlerTests', { before: beforeAll, beforeEach: beforeEachTest });

QUnit.test(
TEST_TAG + 'checkDataAttributes_good_single', function (assert) {
	let data = {'test': true};
	let dataAttribs = ['test'];
	assert.ok(ValidationHandler.checkDataAttributes(data, dataAttribs), 'Check single attrib validation');
});

QUnit.test(
TEST_TAG + 'checkDataAttributes_good_multi', function (assert) {
	let multiData = {'test1': true, 'test2' : 1};
	let multiDataAttribs = ['test1', 'test2'];
	assert.ok(ValidationHandler.checkDataAttributes(multiData, multiDataAttribs), 'Check multi-attrib validation');
});

QUnit.test(
TEST_TAG + 'checkDataAttributes_data_bad', function (assert) {
	assert.throws( () => {
		let data = undefined;
		let dataAttribs = ['test'];
		ValidationHandler.checkDataAttributes(data, dataAttribs);
	},
	RangeError,
	'Check undefined data field throws a RangeError'
	);

	assert.throws( () => {
		let data = null;
		let dataAttribs = ['test'];
		ValidationHandler.checkDataAttributes(data, dataAttribs);
	},
	RangeError,
	'Check null data field throws a RangeError'
	);

	assert.throws( () => {
		let data = [];
		let dataAttribs = ['test'];
		ValidationHandler.checkDataAttributes(data, dataAttribs);
	},
	RangeError,
	'Check using an array for data throws a RangeError'
	);

	assert.throws( () => {
		let data = {};
		let dataAttribs = ['test'];
		ValidationHandler.checkDataAttributes(data, dataAttribs);
	},
	RangeError,
	'Check using a blank JSON for data throws a RangeError'
	);
});

QUnit.test(
TEST_TAG + 'checkDataAttributes_dataAttribs_bad', function (assert) {
	assert.throws( () => {
		let data = {'test': true}
		let dataAttribs = undefined;
		ValidationHandler.checkDataAttributes(data, dataAttribs);
	},
	RangeError,
	'Check undefined dataAttribs field throws a RangeError'
	);

	assert.throws( () => {
		let data = {'test': true}
		let dataAttribs = undefined;
		ValidationHandler.checkDataAttributes(data, dataAttribs);
	},
	RangeError,
	'Check null dataAttribs field throws a RangeError'
	);

	assert.throws( () => {
		let data = {'test': true}
		let dataAttribs = [];
		ValidationHandler.checkDataAttributes(data, dataAttribs);
	},
	RangeError,
	'Check using an array for dataAttribs throws a RangeError'
	);

	assert.throws( () => {
		let data = {'test': true}
		let dataAttribs = {};
		ValidationHandler.checkDataAttributes(data, dataAttribs);
	},
	RangeError,
	'Check using a blank JSON for dataAttribs throws a RangeError'
	);

});

QUnit.test(
TEST_TAG + 'checkDataAttributes_crazy', function (assert) {
	assert.throws( () => {
		ValidationHandler.checkDataAttributes();
	},
	RangeError,
	'Check specifying no parameters throws a RangeError'
	);

	assert.throws( () => {
		ValidationHandler.checkDataAttributes(undefined, undefined);
	},
	RangeError,
	'Check specifying both params as undefined throws a RangeError'
	);

});

QUnit.test(
TEST_TAG + 'notUndefOrNull_true', function (assert) {
	assert.ok(ValidationHandler.notUndefOrNull(1), 'Check an integer value validates.');
	assert.ok(ValidationHandler.notUndefOrNull([]), 'Check an empty Array value validates.');
	assert.ok(ValidationHandler.notUndefOrNull({}), 'Check an empty Object value validates.');
});

QUnit.test(
TEST_TAG + 'notUndefOrNull_false', function (assert) {
	assert.notOk(ValidationHandler.notUndefOrNull(undefined), 'Check undefined data fails validation');
	assert.notOk(ValidationHandler.notUndefOrNull(null), 'Check null data fails validation');
});

QUnit.test(
TEST_TAG + 'notUndefOrNull_crazy', function (assert) {
	assert.ok(ValidationHandler.notUndefOrNull(1, 1), 'Check any extra arg is ignored.');
	assert.ok(ValidationHandler.notUndefOrNull(1, null), 'Check any extra arg is ignored.');
	assert.ok(ValidationHandler.notUndefOrNull(1, undefined), 'Check any extra arg is ignored.');
});

QUnit.test(
TEST_TAG + 'isValidMovementUpdateData_good', function (assert) {
	assert.ok(ValidationHandler.isValidMovementUpdateData(VALID_MOVEMENT_UPDATE), 'Check valid movement data is okay');
});

QUnit.test(
TEST_TAG + 'isValidMovementUpdateData_bad', function (assert) {
	// Stringify and parse the valid data to clone it;
	let invalidData = JSON.parse(JSON.stringify(VALID_MOVEMENT_UPDATE));
	invalidData.username = undefined;
	assert.notOk(ValidationHandler.isValidMovementUpdateData(invalidData), 'Check no username fails validation');

	// Stringify and parse the valid data to clone it;
	let invalidDataOldX = JSON.parse(JSON.stringify(VALID_MOVEMENT_UPDATE));
	invalidDataOldX.old_position.pos_x = undefined;
	assert.notOk(ValidationHandler.isValidMovementUpdateData(invalidDataOldX), 'Check no old pos_x fails validation');

	let invalidDataOldY = JSON.parse(JSON.stringify(VALID_MOVEMENT_UPDATE));
	invalidDataOldY.old_position.pos_y = undefined;
	assert.notOk(ValidationHandler.isValidMovementUpdateData(invalidDataOldY), 'Check no old pos_y fails validation');
});

QUnit.test(
TEST_TAG + 'isValidMovementUpdateData_crazy', function (assert) {
	assert.notOk(ValidationHandler.isValidMovementUpdateData(undefined), 'Check undefined fails validation');
	assert.notOk(ValidationHandler.isValidMovementUpdateData(null), 'Check null fails validation');
});