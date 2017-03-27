//  Testing map-view code, ensuring it's functions behave as expected.
//  These tests currently use global vars (hopefully) declared in map-view,
//  this makes the tests a little fragile, so be warned!

// This set of tests focuses on functions incorporating PixiJS or DOM elements

//TODO Functions more dependant on Pixi resources

// TEST PlayerSprite ()
// TEST MapTileSprite (textureReference)
// TEST getAtlasSubtexture(tileAtlasPath, subtileName)
// TEST makeSpriteFromAtlas (tileAtlasPath, subtileName)
// TEST StatBar (name, pos_x, pos_x)
// TEST showMapPosition(gridX,gridY)

function testCharacterCreation (assert, name, x, y, sprite, expectedMessage) {
  try {
    GridCharacter(name, x, y, sprite);
  } catch (err) {
    assert.equal(err.message, expectedMessage);
  }
}

QUnit.test('grid-character-creation-good', function (assert) {
  var charname = 'foo';
  var x = 0;
  var y = 1;
  var sprite = null;

  expectedCharacter = {
		charname: charname,
		pos_x: x,
		pos_y: y,
		sprite: sprite
	};

  var testGridCharacter = GridCharacter(charname, x, y, sprite);

  //Assert that our expected character is the same as the returned character
  assert.deepEqual(expectedCharacter, testGridCharacter);
}
);


QUnit.test('grid-character-creation-invalid-pos', function (assert) {
  var expectedErrorMessage = 'Invalid position for GridCharacter! (must be valid overworld co-ord)';
  var testName = 'foo';

  testCharacterCreation(assert, testName, -1, 0, null, expectedErrorMessage); //  X out of lower bound
  testCharacterCreation(assert, testName, 0, -1, null, expectedErrorMessage); //  Y out of lower bound
  testCharacterCreation(assert, testName, overworldMapSizeX, 0, null, expectedErrorMessage); // X out of upper bound
  testCharacterCreation(assert, testName, 0, overworldMapSizeY, null, expectedErrorMessage); // Y out of upper bound
  testCharacterCreation(assert, testName, -1, -1, null, expectedErrorMessage);  //  X and Y out of lower bound
  testCharacterCreation(assert, testName, overworldMapSizeX, overworldMapSizeY, null, expectedErrorMessage);  //  X and Y out of upper bound

  assert.expect(6); // Check that errors were thrown and asserted
}
);
