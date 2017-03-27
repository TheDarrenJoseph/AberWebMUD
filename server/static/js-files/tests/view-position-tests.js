//  Testing map-view code, ensuring it's functions behave as expected.
//  These tests currently use global vars (hopefully) declared in map-view,
//  this makes the tests a little fragile, so be warned!

// This set of tests focuses on functions for co-ord positions and conversions

//  Runs the position function passed with x and y params
//  catches any error and checks against the expected error message
function testPositionRangeError (assert, func, x, y, expectedException) {
  try {
    func(x, y);
  } catch (err) {
    //TODO Check for RangeError type
    assert.equal(err.message, expectedException.message);
  }
}

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
  assert.ok(isPositionInMapView(mapGridStartX + tileCount -1 , mapGridStartY + tileCount - 1)); // Highest range possible
}
);

QUnit.test('|POSITION| in-map-view-bad', function (assert) {
  assert.notOk(isPositionInMapView(mapGridStartX - 1, mapGridStartY)); //Lower x bound out of range
  assert.notOk(isPositionInMapView(mapGridStartX, mapGridStartY - 1)); //Lower y bound out of range

  assert.notOk(isPositionInMapView(mapGridStartX + tileCount + 1, 0)); //Higher x bound out of range
  assert.notOk(isPositionInMapView(0, mapGridStartY + tileCount + 1)); //Higher y bound out of range

  assert.notOk(isPositionInMapView(0, 0));                                                         // X and Y just below range
  assert.notOk(isPositionInMapView(mapGridStartX + tileCount, mapGridStartY + tileCount)); // X and Y just above range
}
);

QUnit.test('|POSITION| in-overworld |VALID|', function (assert) {
  assert.ok(isPositionInOverworld(0, 0));   //Lowest possible co-ords
  assert.ok(isPositionInOverworld(overworldMapSizeX-1, overworldMapSizeY-1)); //Highest possible co-ords
}
);

QUnit.test('|POSITION| in-overworld |INVALID|', function (assert) {
  assert.notOk(isPositionInOverworld(-1, 0)); // Under lowest possible co-ords (x)
  assert.notOk(isPositionInOverworld(0, -1)); // Under lowest possible co-ords (y)

  assert.notOk(isPositionInOverworld(overworldMapSizeX, overworldMapSizeY- 1)); //  Over highest possible co-ords (x)
  assert.notOk(isPositionInOverworld(overworldMapSizeX - 1, overworldMapSizeY)); //  Over highest possible co-ords (y)
}
);

QUnit.test('|POSITION| local-to-global |VALID|', function (assert) {
  //Local position (relative to view) is 0-tilecount-1, global = X or Y+XYoffset

  //1. Lowest possible
  var result = localTilePosToGlobal(0, 0);
  assert.equal(result[0], mapGridStartX);
  assert.equal(result[1], mapGridStartY);
  console.log('JHJEEEY '+mapGridStartX+' '+mapGridStartY);

  //2. Highest possible with an offset (-1 for zero indexing)
  var zeroIndexedTileCount = tileCount - 1;
  result = localTilePosToGlobal(zeroIndexedTileCount - mapGridStartX, zeroIndexedTileCount - mapGridStartY);
  assert.equal(result[0], zeroIndexedTileCount);
  assert.equal(result[1], zeroIndexedTileCount);
}
);

QUnit.test('|POSITION| local-to-global |INVALID|', function (assert) {
  var nonRelativeErrror = new RangeError('Local tile pos for conversion not relative to the map view');
  var tilePositionInvalidError = new RangeError ('Local tile pos for conversion plus offset, not in the overworld.');

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

  assert.expect(10); // Expect Error assertions for every test
}
);

QUnit.test('|POSITION| global-to-local |VALID|', function (assert) {
  //Lowest possible X
  var result = globalTilePosToLocal(mapGridStartX, mapGridStartY);
  assert.equal(result[0], 0);
  assert.equal(result[1], 0);

  //Highest possible (-1 for zero indexing)
  var zeroIndexedTileCount = tileCount-1;
  result = globalTilePosToLocal( zeroIndexedTileCount + mapGridStartX, zeroIndexedTileCount + mapGridStartY);
  assert.equal(result[0], zeroIndexedTileCount);
  assert.equal(result[1], zeroIndexedTileCount);
}
);

QUnit.test('|POSITION| global-to-local |INVALID|', function (assert) {
  var tilePositionInvalidError = new RangeError ('Global tile pos for conversion not in the overworld');

  //X over by 1
  testPositionRangeError (assert, globalTilePosToLocal, overworldMapSizeX + 1, 0, tilePositionInvalidError);
  //Y over by 1
  testPositionRangeError (assert, globalTilePosToLocal, 0, overworldMapSizeY + 1, tilePositionInvalidError);
  //X under by 1
  testPositionRangeError (assert, globalTilePosToLocal, -1, 0, tilePositionInvalidError);
  //Y under by 1
  testPositionRangeError (assert, globalTilePosToLocal, 0, -1, tilePositionInvalidError);
  //X and Y over by 1
  testPositionRangeError (assert, globalTilePosToLocal, overworldMapSizeX + 1, overworldMapSizeY + 1, tilePositionInvalidError);
  //X and Y under by 1
  testPositionRangeError (assert, globalTilePosToLocal, -1, -1,  tilePositionInvalidError);

  assert.expect(6); //  Expect Error assertions for every test
}
);

QUnit.test('|POSITION| tile-to-pixi |VALID|', function (assert) {
 //Lowest possible tile pos co-ord
  var result = tileCoordToPixiPos (0,0);
  assert.equal(result[0], 0);
  assert.equal(result[1], 0);

  //Check x co-ord is independant from y, and the next tile over gives the starting pos (top-left) of the tile
  result = tileCoordToPixiPos (1,0);
  assert.equal(result[0], tileSize);
  assert.equal(result[1], 0);

  //Check y co-ord is independant from x, and the next tile over gives the starting pos (top-left) of the tile
  result = tileCoordToPixiPos (0,1);
  assert.equal(result[0], 0);
  assert.equal(result[1], tileSize);

  //Furthest co-ord possible
  var furthestTilePos = (tileCount-1);
  var furthestPixiPos = (furthestTilePos*tileSize);
  console.log('furthestPixiPos: '+furthestPixiPos);

  result = tileCoordToPixiPos (furthestTilePos,furthestTilePos);
  assert.equal(result[0], furthestPixiPos, 'x-value');
  assert.equal(result[1], furthestPixiPos, 'y-value');
}
);

QUnit.test('|POSITION| tile-to-pixi |INVALID|', function (assert) {
  var tilePositionInvalidError = new RangeError('Tile-to-Pixi conversion, tile position invalid!');

  //Negative relative positions should fail
  testPositionRangeError (assert, tileCoordToPixiPos, -1, -1, tilePositionInvalidError);
  //Furthest co-ord possible +1 should fail (not using -1 to tileCount)
  testPositionRangeError (assert, tileCoordToPixiPos, tileCount, tileCount, tilePositionInvalidError);

  //Check x co-ord is independant from y for failure
  testPositionRangeError (assert, tileCoordToPixiPos, -1, 0, tilePositionInvalidError);
  testPositionRangeError (assert, tileCoordToPixiPos, tileCount, 0, tilePositionInvalidError);

  //Check y co-ord is independant from x for failure
  testPositionRangeError (assert, tileCoordToPixiPos, 0, -1, tilePositionInvalidError);
  testPositionRangeError (assert, tileCoordToPixiPos, 0, tileCount, tilePositionInvalidError);

  assert.expect(6); //  Expect Error assertions for every test
}
);

QUnit.test('|POSITION| pixi-to-tile |VALID|', function (assert) {
  //Lowest possible tile pos co-ord
   var result = pixiPosToTileCoord (0,0);
   assert.equal(result[0], 0);
   assert.equal(result[1], 0);

   //Check x co-ord is independant from y, and 1 pixel over the tileSize gives the next tile
   result = pixiPosToTileCoord (tileSize + 1, 0);
   assert.equal(result[0], 1);
   assert.equal(result[1], 0);

   //Check y co-ord is independant from x, and 1 pixel over the tileSize gives the next tile
   result = pixiPosToTileCoord (0, tileSize + 1);
   assert.equal(result[0], 0);
   assert.equal(result[1], 1);

   //Furthest co-ord possible
   var furthestPixiPos = (tileCount-1) * tileSize;
   var furthestTilePos  = furthestPixiPos / tileSize;
   result = pixiPosToTileCoord (furthestPixiPos, furthestPixiPos);
   assert.equal(result[0], furthestTilePos);
   assert.equal(result[1], furthestTilePos);
}
);

QUnit.test('|POSITION| pixi-to-tile |INVALID|', function (assert) {
  var invalidPixiPosError = new RangeError('Pixi-to-Tile conversion, pixi position invalid!');
  //Independant x under range
  testPositionRangeError(assert, pixiPosToTileCoord, -1, 0, invalidPixiPosError);
  //Independant y under range
  testPositionRangeError(assert, pixiPosToTileCoord, 0, -1, invalidPixiPosError);
  //x and y under range
  testPositionRangeError(assert, pixiPosToTileCoord, -1, -1, invalidPixiPosError);

  var furthestPixiPosJustOver = tileCount * tileSize + 1; //Over max pixi pos by 1 pixel

  //Independant x over range by 1 pixelj
  testPositionRangeError(assert, pixiPosToTileCoord, furthestPixiPosJustOver, 0, invalidPixiPosError);
  //Independant y over range by 1 pixel
  testPositionRangeError(assert, pixiPosToTileCoord, 0, furthestPixiPosJustOver, invalidPixiPosError);
  //x and y over range
  testPositionRangeError(assert, pixiPosToTileCoord, furthestPixiPosJustOver, furthestPixiPosJustOver, invalidPixiPosError);
}
);


QUnit.test('set-map-position-valid', function (assert) {
  setMapViewPosition(0,0); //Smallest global position valid
  assert.equal(mapGridStartX,0);
  assert.equal(mapGridStartY,0);

  var tileCountZeroIndexedLen = tileCount-1;
  setMapViewPosition(tileCountZeroIndexedLen, tileCountZeroIndexedLen); //Largest global position valid
  assert.equal(mapGridStartX, tileCountZeroIndexedLen);
  assert.equal(mapGridStartY, tileCountZeroIndexedLen);
}
);

QUnit.test('set-map-position-invalid', function (assert) {
  //Independant x under range
  testPositionRangeError(assert, setMapViewPosition, -1, 0, new RangeError('Position not in overworld: ' + (-1) + ' ' + 0));
  //Independant y under range
  testPositionRangeError(assert, setMapViewPosition, 0, -1, new RangeError('Position not in overworld: ' + 0 + ' ' + (-1)));
  //X and Y under range
  testPositionRangeError(assert, setMapViewPosition, -1, -1, new RangeError('Position not in overworld: ' + (-1) + ' ' + (-1)));

  //Independant x over range
  testPositionRangeError(assert, setMapViewPosition, overworldMapSizeX, 0, new RangeError('Position not in overworld: ' + overworldMapSizeX + ' ' + 0));
  //Independant y over range
  testPositionRangeError(assert, setMapViewPosition, 0, overworldMapSizeY, new RangeError('Position not in overworld: ' + 0 + ' ' + overworldMapSizeY));
  //X and Y over range
  testPositionRangeError(assert, setMapViewPosition,overworldMapSizeX, overworldMapSizeY, new RangeError('Position not in overworld: ' + overworldMapSizeX + ' ' + overworldMapSizeY));

  assert.expect(6); //  Expect Error assertions for every test
}
);
