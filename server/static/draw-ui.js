var chestPath = "static/images/chest.png";
var overworldTilesetPath = "static/assets/gfx/Overworld.png";
var zeldaObjectsTilesetPath = "static/assets/gfx/objects.png";

var tileSize = 40;

//Set our mapWindowSize to the smallest of our page dimensions
//Using the smallest dimension to get a square
//Then use 90% of this value to leave some space
var mapWindowSize = window.innerWidth;
if (window.innerHeight<window.innerWidth) {
	mapWindowSize = window.innerHeight;
}

//tileCount is the number of tiles we can fit into this square area
//Rounding down (floor) to get a good tile count
var tileCount = Math.floor(mapWindowSize/tileSize); 

//Update mapWindowSize to fit the tileCount snugly! 
mapWindowSize = tileCount*tileSize;

// resolution 1 for now as default (handles element scaling)
var renderingOptions = {
	resolution:1
}

//Create our PixiJS renderer space
//var renderer = PIXI.autoDetectRenderer(500, 500, renderingOptions);
var renderer = PIXI.autoDetectRenderer(mapWindowSize, mapWindowSize);
renderer.autoresize = true;

//var stage = new PIXI.Container();
var stage = new PIXI.ParticleContainer(); //Using spritebatch for large amounts of sprites


function makeTestSprite() {
	var testSprite = new PIXI.Sprite(PIXI.loader.resources[chestPath].texture);
	
	//Anchoring to allow interaction and enabling the flag
	testSprite.anchor.x = 0;
	testSprite.anchor.y = 0;
	testSprite.position.x = 0;
	testSprite.position.y = 50;
	testSprite.height = 100;
	testSprite.width = 100;
	
	testSprite.interactive = true;
	
	stage.addChild(testSprite);
	renderer.render(stage); 

	testSprite.click = function() {return objectClicked(testSprite);}
}

function stageClicked() {
	var mouseEvent = renderer.plugins.interaction.pointer.originalEvent;
	
	var clientX = Math.floor(mouseEvent.clientX/tileSize);
	var clientY = Math.floor(mouseEvent.clientY/tileSize);
	
	var zeroIndexedTileCount = tileCount-1;
	
	//Sanity check to make sure we can't click over the boundary
	if (clientX>zeroIndexedTileCount) clientX = zeroIndexedTileCount; 
	if (clientY>zeroIndexedTileCount) clientY = zeroIndexedTileCount; 

	console.log(clientX+' '+clientY);
}

function objectClicked(object) {
	//console.log(object.name+" clicked");
	//object.x += 50;

	//renderer.render(stage); 
}

//Creates a new PIXI.Sprite from a tileset loaded in by Pixi's resource loader
function makeSpriteFromTileset(tilesetPath,offsetX,offsetY,tileSizeX,tileSizeY) {
	var tilesetArea = new PIXI.Rectangle(offsetX,offsetY,tileSizeX,tileSizeY); //A rectangle defining the area of our subtile
	var tileTexture = PIXI.loader.resources[tilesetPath].texture;
	tileTexture.frame = tilesetArea;
	
	return new PIXI.Sprite(tileTexture);
}

function MapTileSprite () {
	//var MapTileSprite = new PIXI.Sprite(PIXI.loader.resources[chestPath].texture);
	var MapTileSprite = makeSpriteFromTileset(overworldTilesetPath,0,0,16,16)
	
	MapTileSprite.height = tileSize;
	MapTileSprite.width = tileSize;
	
	return MapTileSprite;
}

//Allocates a tile array for the map view
function MapArray(tileCount) {
	var tileArray = Array(tileCount);

	for (var x=0; x<tileCount; x++) {
		tileArray[x] = Array(tileCount); //2nd array dimension per row
			for (var y=0; y<tileCount; y++) {
				tileArray[x][y] = MapTileSprite(); //Allocate a new tile
			}
	}
	
	return tileArray;
}

//Write our MapArray to the PixiJS stage
function setupMapUI(tileSpriteArray,tileCount) {
	for (var x=0; x<tileCount; x++) {
		for (var y=0; y<tileCount; y++) {
			var tileSprite = tileSpriteArray[x][y]; //Reference to new tile in the array

			//tileSprite.anchor.x = x*tileSize;
			//tileSprite.anchor.y = y*tileSize;
			//tileSprite.anchor.set(0.1*x);
			
			tileSprite.position.x = x*tileSize;
			tileSprite.position.y = y*tileSize;
			
			//tileSprites[x].position.y = 0;

			tileSprite.interactive = true;
	
			stage.addChild(tileSprite);
			//console.log('new tile at: '+x+' '+y+'...');
			//tileSprite.click = function() {return objectClicked(tileSprite);}
			
			tileSprite.name = ''+x+''+y;
		}
	}
	
	
}

function setupConsoleButton(){

}

function setupContextButtons(){

}

function makeTestSquare() {
	var testSquare = new PIXI.Graphics();

	testSquare.beginFill(0xFFFFFF);
	testSquare.lineStyle(2,0xFFFFFF,1);
	testSquare.drawRect(20,20,200,200);
	testSquare.endFill();
	stage.addChild(testSquare);

	testSquare.interactive = true;

	//Assigning a click event using a callback function to pass the object as params
	testSquare.on("click",function callbackWithTheObject(){ return objectClicked(testSquare); });
}


function assetsLoaded() {
	//Rendering options for Pixi.js
	
	
	//Check that WebGL is supported and that we've managed to use it
	var rendererType;
	if (PIXI.utils.isWebGLSupported() && (renderer instanceof PIXI.WebGLRenderer)) {
		 rendererType = 'WebGL' ;
	} else { renderertype = 'Canvas'; }
	
	console.log("Using renderer option: "+rendererType);
	
	//document.body.appendChild(renderer.view);
	$('#main-window').append(renderer.view);
	

	//console.log ("Using grid size of "+mapWindowSize);
	
	var tileSpriteArray = new MapArray(tileCount);
	setupMapUI(tileSpriteArray,tileCount);
	
	renderer.render(stage); 

	//makeTestSprite();
	$('#main-window').on('click',function(){ return stageClicked(renderer); });
}

function setupPage() {
	$('#message-window').hide();
	
	//Arbitrary assignment of message log window size for now
	$('#message-log').rows = 5;
	$('#message-log').cols = 50;
	$('#message-log').val('');

	//Callback for after assets have loaded (for drawing)
	PIXI.loader.add([chestPath,
	overworldTilesetPath,
	]).load(assetsLoaded);
}

//wait until our document is ready
$(document).ready(setupPage);


