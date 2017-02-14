var type = "WebGL"

if(!PIXI.utils.isWebGLSupported()) type = "canvas"

//Rendering options for Pixi.js
// resolution 1 for now as default (handles element scaling)
var renderingOptions = {
	resolution:1
}

var chestPath = "static/images/chest.png"

//Create our PixiJS renderer space
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, renderingOptions);
renderer.autoresize = true;

document.body.appendChild(renderer.view);

//Best to use the loader class so we can give an indication of asset loading using 'assetLoaded' callback
PIXI.loader.add([chestPath]).load(assetLoaded);

//Add the pixi 'stage' container for our elements
var stage = new PIXI.Container();

var testSquare = new PIXI.Graphics();

testSquare.beginFill(0xFFFFFF);
testSquare.lineStyle(2,0xFFFFFF,1);
testSquare.drawRect(20,20,200,200);
testSquare.endFill();
stage.addChild(testSquare);

testSquare.interactive = true;

//Assigning a click event using a callback function to pass the object as params
testSquare.on("click",function callbackWithTheObject(){ return objectClicked(testSquare); })


function assetLoaded() {
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

function objectClicked(object) {
	console.log(object.name+" clicked");
	object.x += 50;

	renderer.render(stage); 
}
