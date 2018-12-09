import AtlasHelper from 'src/helper/pixi/AtlasHelper.js';

// Setup / assertions before any test runs
function beforeAll (assert) {
	assert.ok(renderer instanceof PIXI.WebGLRenderer ||
					renderer instanceof PIXI.CanvasRenderer, 'Check test Pixi renderer is instanciated.');

		// Assert things that really should be true
		assert.equal(DEFAULT_TILE_SIZE, 40, 'Check default tile size (pixels) is as expected.')
		assert.equal(TEST_WINDOW_SIZE, 800, 'Check test window size (pixels) is as expected.')
	// DO SOME STUFF
}

// Setup / assertions before each test
function beforeEachTest (assert) {

}

// Hookup before each test setup / assertion
QUnit.module('PixiMapViewTests', { before: beforeAll, beforeEach: beforeEachTest })

// Ensure the pixi map view data builds as we expect it to
QUnit.skip(
TEST_TAG + 'getAtlasSubtexture', function (assert) {
	var spriteTexture = AtlasHelper.getAtlasSubtexture(tileAtlasPath, subtileName);
});
