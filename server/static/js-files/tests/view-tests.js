//  Testing map-view code, ensuring it's functions behave as expected.
//  These tests currently use global vars (hopefully) declared in map-view,
//  this makes the tests a little fragile, so be warned!

//TODO Functions more dependant on Pixi resources

// TEST PlayerSprite ()
// TEST MapTileSprite (textureReference)
// TEST getAtlasSubtexture(tileAtlasPath, subtileName)
// TEST makeSpriteFromAtlas (tileAtlasPath, subtileName)
// TEST StatBar (name, posX, posY)

function beforeTests () {
  //Start co-ords of the map view window, This affects the local co-ord calculations
  mapGridStartX = 5;
  mapGridStartX = 5;

  //Set overworld size limits, for all other co-ord calculations
  overworldMapSizeX = 25;
  overworldMapSizeY = 25;

  tileCount = 20; //  mapSizeXY-startPosXY
}

function testCharacterCreation (assert, name, x, y, sprite, expectedMessage) {
  try {
    GridCharacter(name, x, y, sprite);
  } catch (err) {
    assert.equal(err.message, expectedMessage);
  }
}

function testPositionRangeError (assert, func, x, y, expectedMessage) {
  try {
    func(x, y);
  } catch (err) {
    //TODO Check for RangeError type
    assert.equal(err.message, expectedMessage);
  }
}

QUnit.module('viewTests', { beforeEach: beforeTests });

QUnit.test('grid-character-creation-good', function (assert) {
  var charname = 'foo';
  var x = 0;
  var y = 1;
  var sprite = null;

  expectedCharacter = {
		charname: charname,
		posX: x,
		posY: y,
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

//Testing relative co-ords (tile view co-ords) that are 0 indexed
QUnit.test('|POSITION| relative-to-view-good', function (assert) {
  assert.ok(isPositionRelativeToView(0,0)); //Lowest possible
  assert.ok(isPositionRelativeToView(tileCount-1, tileCount-1)); //Highest possible (-1 for 0 indexing)
}
);

QUnit.test('|POSITION| relative-to-view-bad', function (assert) {
  assert.notOk(isPositionRelativeToView(-1, 0));                        //  Lower x bound out of range
  assert.notOk(isPositionRelativeToView(0, -1));                        //  Lower y bound out of range
  assert.notOk(isPositionRelativeToView(tileCount + 1, 0));             //  Higher x bound out of range
  assert.notOk(isPositionRelativeToView(0, tileCount + 1));             //  Higher y bound out of range
  assert.notOk(isPositionRelativeToView(-1, -1));                       //  Lower x and y bound out of range
  assert.notOk(isPositionRelativeToView(tileCount + 1, tileCount + 1)); //  Upper x and y bound out of range
}
);


QUnit.test('|POSITION| in-map-view-good', function (assert) {
  assert.ok(isPositionInMapView(mapGridStartX, mapGridStartY)); //  Lowest range posible
  assert.ok(isPositionInMapView(mapGridStartX + tileCount, mapGridStartY + tileCount)); // Highest range possible
}
);

QUnit.test('|POSITION| in-map-view-bad', function (assert) {
  assert.notOk(isPositionInMapView(mapGridStartX - 1, mapGridStartY)); //Lower x bound out of range
  assert.notOk(isPositionInMapView(mapGridStartX, mapGridStartY - 1)); //Lower y bound out of range

  assert.notOk(isPositionInMapView(mapGridStartX + tileCount + 1, 0)); //Higher x bound out of range
  assert.notOk(isPositionInMapView(0, mapGridStartY + tileCount + 1)); //Higher y bound out of range

  assert.notOk(isPositionInMapView(0, 0));                                                         // X and Y just below range
  assert.notOk(isPositionInMapView(mapGridStartX + tileCount + 1, mapGridStartY + tileCount + 1)); // X and Y just above range
}
);

QUnit.test('|POSITION| in-overworld |VALID|', function (assert) {
  assert.ok(isPositionInOverworld(0, 0));   //Lowest possible co-ords
  assert.ok(isPositionInOverworld(24, 24)); //Highest possible co-ords
}
);

QUnit.test('|POSITION| in-overworld |INVALID|', function (assert) {
  //isPositionInOverworld(x, y);
  assert.notOk(isPositionInOverworld(-1, 0)); // Under lowest possible co-ords (x)
  assert.notOk(isPositionInOverworld(0, -1)); // Under lowest possible co-ords (y)

  assert.notOk(isPositionInOverworld(tileCount, tileCount - 1)); //  Over highest possible co-ords (x)
  assert.notOk(isPositionInOverworld(tileCount - 1, tileCount)); //  Over highest possible co-ords (y)
}
);

QUnit.test('|POSITION| local-to-global |VALID|', function (assert) {
  //Local position (relative to view) is 0-tilecount-1, global = X or Y+XYoffset

  //1. Lowest possible
  var result = localTilePosToGlobal(0, 0);
  assert.equal(result[0], mapGridStartX);
  assert.equal(result[1], mapGridStartY);

  //2. Highest possible (-1 for zero indexing)
  result = localTilePosToGlobal(tileCount - 1 + mapGridStartX, tileCount - 1 + mapGridStartY);
  assert.equal(result[0], tileCount+mapGridStartX);
  assert.equal(result[1], tileCount+mapGridStartY);

  //3. Negative co-ords should be okay up to the startXY offset
  result = localTilePosToGlobal(0-mapGridStartX, 0-mapGridStartY);
  assert.equal(result[0], 0);
  assert.equal(result[1], 0);
}
);

QUnit.test('|POSITION| local-to-global |INVALID|', function (assert) {
  //localTilePosToGlobal (localX, localY)
  localTilePosToGlobal(-1, -1);

  var nonRelativeErrror = new RangeError('Local tile pos for conversion not relative to the map view');
  var nonOverworldError = new RangeError ('Local tile pos for conversion plus offset, not in the overworld.');

  testPositionRangeError (assert, localTilePosToGlobal, 0-mapGridStartX-1, 0, nonRelativeErrror);
  testPositionRangeError (assert, localTilePosToGlobal, 0, 0-mapGridStartY, nonRelativeErrror);
  testPositionRangeError (assert, localTilePosToGlobal, tileCount, 0, nonRelativeErrror);
  testPositionRangeError (assert, localTilePosToGlobal, 0, tileCount, nonRelativeErrror);
  testPositionRangeError (assert, localTilePosToGlobal, 0-mapGridStartX, 0-mapGridStartY, nonRelativeErrror);
  testPositionRangeError (assert, localTilePosToGlobal, tileCount, tileCount, nonRelativeErrror);

  //Overworld pos oveerrun
  testPositionRangeError (assert, localTilePosToGlobal, overworldMapSizeX - mapGridStartX + 1, 0, nonRelativeErrror);
  testPositionRangeError (assert, localTilePosToGlobal, 0, overworldMapSizeY - mapGridStartY + 1, nonRelativeErrror);

  //Overworld pos underrun
  testPositionRangeError (assert, localTilePosToGlobal, 0-(mapGridStartX+1), 0, nonRelativeErrror);
  testPositionRangeError (assert, localTilePosToGlobal, 0, 0-(mapGridStartY+1), nonRelativeErrror);
}
);

QUnit.test('|POSITION| global-to-local |VALID|', function (assert) {
  //Lowest possible X
  var result = globalTilePosToLocal(mapGridStartX, mapGridStartY);
  assert.equal(result[0], 0);
  assert.equal(result[1], 0);

  //Highest possible (-1 for zero indexing)
  result = globalTilePosToLocal( (overworldMapSizeX - 1) + mapGridStartX, (overworldMapSizeX - 1) + mapGridStartY);
  assert.equal(result[0], tileCount);
  assert.equal(result[1], tileCount);
}
);

QUnit.test('|POSITION| global-to-local |INVALID|', function (assert) {
  testPositionRangeError (assert, globalTilePosToLocal, overworldMapSizeX + 1, 0, nonRelativeErrror);
  testPositionRangeError (assert, globalTilePosToLocal, 0, overworldMapSizeY + 1, nonRelativeErrror);
  testPositionRangeError (assert, globalTilePosToLocal, -1, 0, nonRelativeErrror);
  testPositionRangeError (assert, globalTilePosToLocal, 0, -1, nonRelativeErrror);
  testPositionRangeError (assert, globalTilePosToLocal, overworldMapSizeX + 1, overworldMapSizeY + 1, nonRelativeErrror);
  testPositionRangeError (assert, globalTilePosToLocal, -1, -1, nonRelativeErrror);
}
);

QUnit.test('|POSITION| tile-to-pixi |VALID|', function (assert) {
  throw new Error('Test unimplemented!');
  // tileCoordToPixiPos (x,y)
}
);

QUnit.test('|POSITION| tile-to-pixi |INVALID|', function (assert) {
  throw new Error('Test unimplemented!');
  // tileCoordToPixiPos (x,y)
}
);

QUnit.test('|POSITION| pixi-to-tile |VALID|', function (assert) {
  throw new Error('Test unimplemented!');
  // pixiPosToTileCoord
}
);

QUnit.test('|POSITION| pixi-to-tile |INVALID|', function (assert) {
  throw new Error('Test unimplemented!');
  // pixiPosToTileCoord
}
);

QUnit.test('show-map-position', function (assert) {
  throw new Error('Test unimplemented!');
  //  showMapPosition(gridX,gridY){
  assert.expect(0);
}
);
