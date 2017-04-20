//Sets up the global variables used for view calculation so they're defined for our testing
function beforeTests () {
  //Start co-ords of the map view window, This affects the local co-ord calculations
  mapGridStartX = 5;
  mapGridStartY = 5;

  //Set overworld size limits, for all other co-ord calculations
  overworldMapSizeX = 50;
  overworldMapSizeY = 50;

  tileCount = 20; //  mapSizeXY-startpos_xY
  tileSize = 40; //  Default tile size
}

QUnit.module('viewTests', { beforeEach: beforeTests });
