import PIXI from 'libs/pixi.min.js';
import SpriteHelper from 'src/helper/pixi/SpriteHelper.js';

import { DEFAULT_TILE_SIZE } from 'src/model/pixi/map/MapModel.js';
import { ASSET_PATHS } from 'src/controller/pixi/PixiController.js';
import { DEFAULT_TILE_MAPPINGS } from 'src/view/pixi/PixiMapView.js';

var TEST_TAG = '|SPRITE-HELPER|';
let MAX_TIMEOUT = 5000;

function beforeAll (assert) {
	// DO SOME STUFF
}

function beforeEachTest (assert) {
	// DO SOME STUFF
}

// Hookup before each test setup / assertion
QUnit.module('SpriteHelperTests', { before: beforeAll, beforeEach: beforeEachTest });

QUnit.test(
TEST_TAG + 'makeSpriteFromAtlas_Player', function (assert) {
	assert.timeout(MAX_TIMEOUT);

  let asyncSprite =	assert.async(1);
	var pixiPos = new PIXI.Point(1,1);
	// Promise the loading of the subtexture
	var spritePromise = SpriteHelper.makeSpriteFromAtlas(ASSET_PATHS.ASSET_PATH_CHARACTERS, 'player', DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE, pixiPos, false);
	spritePromise.then(sprite => {
		assert.deepEqual([sprite.x, sprite.y], [1, 1], 'Check Sprite PIXI.Position');
		assert.deepEqual([sprite.width, sprite.height], [DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE], 'Check Sprite Size is correct.');
		asyncSprite();
	})

	assert.expect(2);

});

QUnit.test(
TEST_TAG + 'makeSpriteFromAtlas_Tile', function (assert) {
	assert.timeout(MAX_TIMEOUT);

	let asyncSprite =	assert.async(1);
	var pixiPos = new PIXI.Point(1,1);
	let subtileName = DEFAULT_TILE_MAPPINGS[1];
	// Promise the loading of the subtexture
	var spritePromise = SpriteHelper.makeSpriteFromAtlas(ASSET_PATHS.ASSET_PATH_OVERWORLD, subtileName, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE, pixiPos, false);
	spritePromise.then(sprite => {
		assert.deepEqual([sprite.x, sprite.y], [1, 1], 'Check Sprite PIXI.Position');
		assert.deepEqual([sprite.width, sprite.height], [DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE], 'Check Sprite Size is correct.')
		asyncSprite();
	})

	assert.expect(2);
});
