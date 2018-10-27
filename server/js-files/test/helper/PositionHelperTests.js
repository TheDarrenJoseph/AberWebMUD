import MapController from 'src/controller/pixi/MapController.js';
import PositionHelper from 'src/helper/PositionHelper.js';

// Extract the map model from our controller
var mapModel = MapController.mapModel;

//	Sets up the global variables used for view calculation so they're defined for our testing
function beforeTests () {
	// DO SOME STUFF
}

var POSITION_TEST_TAG = '|POSITION|';

QUnit.module('viewPositionTests', { beforeEach: beforeTests });

//  Runs the position function passed with x and y params
//  catches any error and checks against the expected error message
export function testPositionRangeError (assert, func, x, y, expectedException) {
	try {
		func(x, y);
	} catch (err) {
		console.log('Checking error message equivalance for: (' + err.message + ') and (' + expectedException.message + ')');
		assert.equal(err.message, expectedException.message);
		console.log('Assertion made for position: ' + x + ' ' + y);
	}
}

export function rangeErrorString (posX, posY) {
	return 'Position not in overworld: ' + (posX) + ' ' + (posY);
}

//	Testing relative co-ords (tile view co-ords) that are 0 indexed
QUnit.test(POSITION_TEST_TAG + 'relative-to-view-valid', function (assert) {
	console.log('mapViewStartX = ' + mapModel.mapViewStartX);
	//	Lowest possible
	assert.ok(PositionHelper.isPositionRelativeToView(0, 0));
	//	Highest possible (-1 for 0 indexing)
	assert.ok(PositionHelper.isPositionRelativeToView(mapModel.tileCount - 1, mapModel.tileCount - 1));
}
);

QUnit.test(POSITION_TEST_TAG + 'relative-to-view-invalid', function (assert) {
	//  Lower x bound out of range
	assert.notOk(
		PositionHelper.isPositionRelativeToView(-1, 0));
	//  Lower y bound out of range
	assert.notOk(PositionHelper.isPositionRelativeToView(0, -1));
	//  Higher x bound out of range
	assert.notOk(PositionHelper.isPositionRelativeToView(
		mapModel.tileCount + 1, 0));
	//  Higher y bound out of range
	assert.notOk(PositionHelper.isPositionRelativeToView(
		0, mapModel.tileCount + 1));
	//  Lower x and y bound out of range
	assert.notOk(PositionHelper.isPositionRelativeToView(-1, -1));
	//  Upper x and y bound out of range
	assert.notOk(PositionHelper.isPositionRelativeToView(
		mapModel.tileCount + 1, mapModel.tileCount + 1));
}
);

QUnit.test(POSITION_TEST_TAG + 'in-map-view-valid', function (assert) {
	//  Lowest range posible
	assert.ok(PositionHelper.isPositionInMapView(mapModel.mapViewStartX, mapModel.mapViewStartY));
	// Highest range possible
	assert.ok(
		PositionHelper.isPositionInMapView(mapModel.mapViewStartX + mapModel.tileCount - 1,
			mapModel.mapViewStartY + mapModel.tileCount - 1));
}
);

QUnit.test(POSITION_TEST_TAG + 'in-map-view-invalid', function (assert) {
	//	Lower x bound out of range
	assert.notOk(PositionHelper.isPositionInMapView(mapModel.mapViewStartX - 1, mapModel.mapViewStartY));
	//	Lower y bound out of range
	assert.notOk(PositionHelper.isPositionInMapView(mapModel.mapViewStartX, mapModel.mapViewStartY - 1));
	// Higher x bound out of range
	assert.notOk(PositionHelper.isPositionInMapView(mapModel.mapViewStartX + mapModel.tileCount + 1, 0));
	//	Higher y bound out of range
	assert.notOk(PositionHelper.isPositionInMapView(0, mapModel.mapViewStartY + mapModel.tileCount + 1));
	// X and Y just below range
	assert.notOk(PositionHelper.isPositionInMapView(0, 0));
	// X and Y just above range
	assert.notOk(PositionHelper.isPositionInMapView(mapModel.mapViewStartX + mapModel.tileCount, mapModel.mapViewStartY + mapModel.tileCount));
}
);

QUnit.test(POSITION_TEST_TAG + 'in-overworld-valid', function (assert) {
	//	Lowest possible co-ords
	assert.ok(PositionHelper.isPositionInOverworld(0, 0));
	//	Highest possible co-ords
	assert.ok(PositionHelper.isPositionInOverworld(mapModel.mapSizeX - 1, mapModel.mapSizeY - 1));
}
);

QUnit.test(POSITION_TEST_TAG + 'in-overworld-invalid', function (assert) {
	assert.notOk(PositionHelper.isPositionInOverworld(-1, 0)); // Under lowest possible co-ords (x)
	assert.notOk(PositionHelper.isPositionInOverworld(0, -1)); // Under lowest possible co-ords (y)

	assert.notOk(PositionHelper.isPositionInOverworld(mapModel.mapSizeX, mapModel.mapSizeXY - 1)); //  Over highest possible co-ords (x)
	assert.notOk(PositionHelper.isPositionInOverworld(mapModel.mapSizeXY - 1, mapModel.mapSizeY)); //  Over highest possible co-ords (y)
}
);

QUnit.test(POSITION_TEST_TAG + 'local-to-global-valid', function (assert) {
  //	Local position (relative to view) is 0-tilecount-1, global = X or Y+XYoffset

  //	1. Lowest possible
	var result = PositionHelper.localTilePosToGlobal(0, 0);
	assert.equal(result[0], mapModel.mapViewStartX);
	assert.equal(result[1], mapModel.mapViewStartY);

	//	2. Highest possible with an offset (-1 for zero indexing)
	var zeroIndexedTileCount = mapModel.tileCount - 1;
	result = PositionHelper.localTilePosToGlobal(zeroIndexedTileCount - mapModel.mapViewStartX, zeroIndexedTileCount - mapModel.mapViewStartY);
	assert.equal(result[0], zeroIndexedTileCount);
	assert.equal(result[1], zeroIndexedTileCount);
}
);

QUnit.test(POSITION_TEST_TAG + 'local-to-global-invalid', function (assert) {
	var nonRelativeErrror = new RangeError('Local tile pos for conversion not relative to the map view');
	// var tilePositionInvalidError = new RangeError('Local tile pos for conversion plus offset, not in the overworld.');

	testPositionRangeError(assert, PositionHelper.localTilePosToGlobal, 0 - mapModel.mapViewStartX - 1, 0, nonRelativeErrror);
	testPositionRangeError(assert, PositionHelper.localTilePosToGlobal, 0, 0 - mapModel.mapViewStartY, nonRelativeErrror);
	testPositionRangeError(assert, PositionHelper.localTilePosToGlobal, mapModel.tileCount, 0, nonRelativeErrror);
	testPositionRangeError(assert, PositionHelper.localTilePosToGlobal, 0, mapModel.tileCount, nonRelativeErrror);
	testPositionRangeError(assert, PositionHelper.localTilePosToGlobal, 0 - mapModel.mapViewStartX, 0 - mapModel.mapViewStartY, nonRelativeErrror);
	testPositionRangeError(assert, PositionHelper.localTilePosToGlobal, mapModel.tileCount, mapModel.tileCount, nonRelativeErrror);

	//	Overworld pos oveerrun
	testPositionRangeError(assert, PositionHelper.localTilePosToGlobal, mapModel.mapSizeX - mapModel.mapViewStartX + 1, 0, nonRelativeErrror);
	testPositionRangeError(assert, PositionHelper.localTilePosToGlobal, 0, mapModel.mapSizeX - mapModel.mapViewStartY + 1, nonRelativeErrror);

	//	Overworld pos underrun
	testPositionRangeError(assert, PositionHelper.localTilePosToGlobal, 0 - (mapModel.mapViewStartX + 1), 0, nonRelativeErrror);
	testPositionRangeError(assert, PositionHelper.localTilePosToGlobal, 0, 0 - (mapModel.mapViewStartY + 1), nonRelativeErrror);

	assert.expect(10); // Expect Error assertions for every test
}
);

QUnit.test(POSITION_TEST_TAG + 'global-to-local-valid', function (assert) {
  //	Lowest possible X
	let result = PositionHelper.globalTilePosToLocal(mapModel.mapViewStartX, mapModel.mapViewStartY);
	assert.equal(result[0], 0);
	assert.equal(result[1], 0);

	//	Highest possible (-1 for zero indexing)
	var zeroIndexedTileCount = mapModel.tileCount - 1;
	result = PositionHelper.globalTilePosToLocal(zeroIndexedTileCount + mapModel.mapViewStartX, zeroIndexedTileCount + mapModel.mapViewStartY);
	assert.equal(result[0], zeroIndexedTileCount);
	assert.equal(result[1], zeroIndexedTileCount);
}
);

QUnit.test(POSITION_TEST_TAG + 'global-to-local-invalid', function (assert) {
	var tilePositionInvalidError = new RangeError('Global tile pos for conversion not in the overworld');

	//	X over by 1
	PositionHelper.testPositionRangeError(assert, PositionHelper.globalTilePosToLocal, mapModel.mapSizeX + 1, 0, tilePositionInvalidError);
	//	Y over by 1
	PositionHelper.testPositionRangeError(assert, PositionHelper.globalTilePosToLocal, 0, mapModel.mapSizeY + 1, tilePositionInvalidError);
	//	X under by 1
	PositionHelper.testPositionRangeError(assert, PositionHelper.globalTilePosToLocal, -1, 0, tilePositionInvalidError);
	//	Y under by 1
	PositionHelper.testPositionRangeError(assert, PositionHelper.globalTilePosToLocal, 0, -1, tilePositionInvalidError);
	//	X and Y over by 1
	PositionHelper.testPositionRangeError(assert, PositionHelper.globalTilePosToLocal, mapModel.mapSizeX + 1, mapModel.mapSizeY + 1, tilePositionInvalidError);
	//	X and Y under by 1
	PositionHelper.testPositionRangeError(assert, PositionHelper.globalTilePosToLocal, -1, -1, tilePositionInvalidError);

	assert.expect(6); //  Expect Error assertions for every test
}
);

QUnit.test(POSITION_TEST_TAG + 'tile-to-pixi-valid', function (assert) {
	//	Lowest possible tile pos co-ord
	var result = PositionHelper.tileCoordToPixiPos(0, 0);
	assert.equal(result[0], 0);
	assert.equal(result[1], 0);

	//	Check x co-ord is independant from y, and the next tile over gives the starting pos (top-left) of the tile
	result = PositionHelper.tileCoordToPixiPos(1, 0);
	assert.equal(result[0], mapModel.tileSize);
	assert.equal(result[1], 0);

	//	Check y co-ord is independant from x, and the next tile over gives the starting pos (top-left) of the tile
	result = PositionHelper.tileCoordToPixiPos(0, 1);
	assert.equal(result[0], 0);
	assert.equal(result[1], mapModel.tileSize);

	//	Furthest co-ord possible
	var furthestTilePos = (mapModel.tileCount - 1);
	var furthestPixiPos = (furthestTilePos * mapModel.tileSize);
	console.log('furthestPixiPos: ' + furthestPixiPos);

	result = PositionHelper.tileCoordToPixiPos(furthestTilePos, furthestTilePos);
	assert.equal(result[0], furthestPixiPos, 'x-value');
	assert.equal(result[1], furthestPixiPos, 'y-value');
}
);

QUnit.test(POSITION_TEST_TAG + 'tile-to-pixi-invalid', function (assert) {
	var tilePositionInvalidError = new RangeError('Tile-to-Pixi conversion, tile position invalid!');

	//	Negative relative positions should fail
	PositionHelper.testPositionRangeError(assert, PositionHelper.tileCoordToPixiPos, -1, -1, tilePositionInvalidError);
	//	Furthest co-ord possible +1 should fail (not using -1 to tileCount)
	PositionHelper.testPositionRangeError(assert, PositionHelper.tileCoordToPixiPos, mapModel.tileCount, mapModel.tileCount, tilePositionInvalidError);

	//	Check x co-ord is independant from y for failure
	PositionHelper.testPositionRangeError(assert, PositionHelper.tileCoordToPixiPos, -1, 0, tilePositionInvalidError);
	PositionHelper.testPositionRangeError(assert, PositionHelper.tileCoordToPixiPos, mapModel.tileCount, 0, tilePositionInvalidError);

	//	Check y co-ord is independant from x for failure
	PositionHelper.testPositionRangeError(assert, PositionHelper.tileCoordToPixiPos, 0, -1, tilePositionInvalidError);
	PositionHelper.testPositionRangeError(assert, PositionHelper.tileCoordToPixiPos, 0, mapModel.tileCount, tilePositionInvalidError);

	assert.expect(6); //  Expect Error assertions for every test
}
);

QUnit.test(POSITION_TEST_TAG + 'pixi-to-tile-valid', function (assert) {
	//	Lowest possible tile pos co-ord
	var result = PositionHelper.pixiPosToTileCoord(0, 0);
	assert.equal(result[0], 0);
	assert.equal(result[1], 0);

	//	Check x co-ord is independant from y, and 1 pixel over the tileSize gives the next tile
	result = PositionHelper.pixiPosToTileCoord(mapModel.tileSize + 1, 0);
	assert.equal(result[0], 1);
	assert.equal(result[1], 0);

	//	Check y co-ord is independant from x, and 1 pixel over the tileSize gives the next tile
	result = PositionHelper.pixiPosToTileCoord(0, mapModel.tileSize + 1);
	assert.equal(result[0], 0);
	assert.equal(result[1], 1);

	//	Furthest co-ord possible
	let furthestPixiPos = (mapModel.tileCount - 1) * mapModel.tileSize;
	let furthestTilePos = furthestPixiPos / mapModel.tileSize;
	result = PositionHelper.pixiPosToTileCoord(furthestPixiPos, furthestPixiPos);
	assert.equal(result[0], furthestTilePos);
	assert.equal(result[1], furthestTilePos);
}
);

QUnit.test(POSITION_TEST_TAG + 'pixi-to-tile-invalid', function (assert) {
	var invalidPixiPosError = new RangeError('Pixi-to-Tile conversion, pixi position invalid!');
	//	Independant x under range
	testPositionRangeError(assert, PositionHelper.pixiPosToTileCoord, -1, 0, invalidPixiPosError);
	//	Independant y under range
	testPositionRangeError(assert, PositionHelper.pixiPosToTileCoord, 0, -1, invalidPixiPosError);
	//	x and y under range
	testPositionRangeError(assert, PositionHelper.pixiPosToTileCoord, -1, -1, invalidPixiPosError);

	//	Over max pixi pos by 1 pixel
	var furthestPixiPosJustOver = mapModel.tileCount * mapModel.tileSize + 1;

	//	Independant x over range by 1 pixelj
	testPositionRangeError(assert, PositionHelper.pixiPosToTileCoord, furthestPixiPosJustOver, 0, invalidPixiPosError);
	//	Independant y over range by 1 pixel
	testPositionRangeError(assert, PositionHelper.pixiPosToTileCoord, 0, furthestPixiPosJustOver, invalidPixiPosError);
	//	x and y over range
	testPositionRangeError(assert, PositionHelper.pixiPosToTileCoord, furthestPixiPosJustOver, furthestPixiPosJustOver, invalidPixiPosError);
}
);
