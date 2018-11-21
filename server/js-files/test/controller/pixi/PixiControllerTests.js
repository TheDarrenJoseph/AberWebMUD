import { PixiController } from 'src/controller/pixi/PixiController.js';

var PIXICONTROLLER_TEST_TAG = '|PIXI CONTROLLER|';

// Check Pixi Tile mapping codes
// A bit of a dumb test until the tilemappings are improved
QUnit.test(PIXICONTROLLER_TEST_TAG + 'getTileMapping-valid', function (assert) {
	let expectedMappings = ['grass-plain', 'barn-front'];
	assert.deepEqual(PixiController.tileMappings, expectedMappings, 'Expecting tilemappings: ' + PixiController.tileMappings + ' To match: ' + expectedMappings);

	assert.equal(PixiController.getTileMapping(0), 'grass-plain', 'Check getting first is grass-plain');
	assert.equal(PixiController.getTileMapping(1), 'barn-front', 'Check getting second is barn-front');
}
);
