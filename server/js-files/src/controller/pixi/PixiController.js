// Central controller for Pixi Views
import * as PIXI from 'libs/pixi.min.js';

// Default imports
import Map from 'src/model/Map.js';
import PageChatView from 'src/view/page/PageChatView.js';
import SocketHandler from 'src/handler/socket/SocketHandler.js';
import PageController from 'src/controller/PageController.js';
import SpriteHelper from 'src/helper/pixi/SpriteHelper.js';
import MapPositionHelper from 'src/helper/MapPositionHelper.js';
import PixiView from 'src/view/pixi/PixiView.js';
import PixiMapView from 'src/view/pixi/PixiMapView.js';

// Named imports
import { Session } from 'src/model/SessionModel.js';
import { PageView } from 'src/view/page/PageView.js';

// import { ValidationHandler } from 'src/handler/ValidationHandler.js';

// Main Pixi handling point
//	App Constants
export var titleText = 'AberWebMUD';

var zeldaAssetPath = 'static/assets/gfx/';
var overworldAtlasPath = zeldaAssetPath + 'overworld-texture-atlas.json';
var zeldaObjectsAtlasPath = zeldaAssetPath + 'zelda-objects-texture-atlas.json';
var characterAtlasPath = zeldaAssetPath + 'character-texture-atlas.json';

// HTML 5 Canvas
let RENDERER_CANVAS = 'Canvas';
let RENDERER_WEBGL = 'WebGL';

//	Handles the PixiJS renderer
class PixiControllerClass {
	constructor () {
		this.pixiView = new PixiView(PageView.getWindowDimensions());

		// resolution 1 for now as default (handles element scaling)
		//this.renderingOptions = {
		//	resolution: 1
		//};

		//	Maps tile codes to resource keys
		this.tileMappings = ['grass-plain', 'barn-front'];
	}

	// Returns the correct atlas path for the main overworld map
	getOverworldAtlasPath () {
		return overworldAtlasPath;
	}

	// Returns the correct atlas path for assorted objects
	getZeldaObjectAtlasPath () {
		return zeldaObjectsAtlasPath;
	}

	// Returns the correct atlas path for assorted characters
	getCharacterAtlasPath () {
		return characterAtlasPath;
	}

	getTileMappings () {
		return this.tileMappings;
	}

	// Slightly cleaner way to access the indexed tile keys
	getTileMapping (tileTypeIndex) {
		return this.tileMappings[tileTypeIndex];
	}

	createSprite (atlasPath, subtileName, tileHeight, tileWidth, x, y, interactive) {
		var thisSprite = SpriteHelper.makeSpriteFromAtlas(atlasPath, subtileName);

		thisSprite.height = tileHeight;
		thisSprite.width = tileWidth;

		thisSprite.x = x;
		thisSprite.y = y;

		thisSprite.interactive = interactive;
		return thisSprite;
	}

	setupConsoleButton () {
		var mapTileSize = MapView.tileSize;

		var consoleButtonSprite = this.createSprite(zeldaObjectsAtlasPath,
																						'chat-bubble-blank',
																						mapTileSize,
																						mapTileSize,
																						0,
																						Map.mapWindowSize - mapTileSize,
																						true);

		PixiMapView.controlsContainer.addChild(consoleButtonSprite);
		consoleButtonSprite.on('click', PageView.toggleConsoleVisibility);
	}

	createInventoryButton (atlasPath, subtileName) {
		return this.createSprite(zeldaObjectsAtlasPath,
		subtileName,
		PixiMapView.tileSize,
		PixiMapView.tileSize * 2,
		PixiMapView.mapWindowSize - (MapView.tileSize * 2),
		PixiMapView.mapWindowSize - MapView.tileSize,
		true
		);
	}

	createStatsButton (atlasPath, subtileName) {
		return this.createSprite(atlasPath,
		subtileName,
		PixiMapView.tileSize,
		PixiMapView.tileSize * 2,
		PixiMapView.mapWindowSize - MapView.tileSize * 4,
		MapView.mapWindowSize - MapView.tileSize,
		true
	);
	}

	setupContextButtons () {
		//	var inventoryButtonSprite = makeSpriteFromTileset(zeldaObjectsTilesetPath, 0, 0, 16, 16);
		var inventoryButtonSprite = this.createInventoryButton(zeldaObjectsAtlasPath, 'chest-single');
		PixiMapView.controlsContainer.addChild(inventoryButtonSprite);

		var statsButtonSprite = this.createStatsButton(zeldaObjectsAtlasPath, 'chest-single');
		PixiMapView.controlsContainer.addChild(statsButtonSprite);

		return [inventoryButtonSprite, statsButtonSprite];
	}

	setupUI () {
		this.showStatBars();

		PixiMapView.tileSpriteArray = PixiMapView.setupMapUI(overworldAtlasPath, Map.tileCount, MapView.tileSize);

		this.setupConsoleButton();
		var contextButtons = this.setupContextButtons();

		contextButtons[0].on('click', PageView.toggleIventoryWinVisibility);
		contextButtons[1].on('click', PageView.toggleStatWinVisibility);

		PageView.appendToConsoleButtonClass(contextButtons);
	}

	getRendererType () {
		let rendererType = RENDERER_CANVAS;
		// Check that WebGL is supported and that we've managed to use it
		if (PIXI.utils.isWebGLSupported() && (this.renderer instanceof PIXI.WebGLRenderer)) {
			rendererType = RENDERER_WEBGL;
		}

		return rendererType;
	}

	assetsLoaded () {
		console.log(this);
		console.log('Using renderer option: ' + this.getRendererType());
		PageView.appendToMainWindow(this.renderer.view);
		this.showLoginControls();
	}

	setupPixiUI () {
		console.log('Setting up' + this);
		PageChatView.clearMessageLog();
		PageChatView.hidePasswordInput();

		// Callback for after assets have loaded (for drawing)
		PIXI.loader.add([overworldAtlasPath,
			zeldaObjectsAtlasPath,
			characterAtlasPath]).load(this.assetsLoaded.apply(this));
	}

	// Sets the timeout trigger for a double-click
	stageClicked () {
		var mouseEvent = this.renderer.plugins.interaction.pointer.originalEvent;
		//	console.log(pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY));
		setTimeout(function () { return PageController.stageDoubleClicked(mouseEvent); }, 150);
	}

	// Trigger function on second click
	stageDoubleClicked (mouseEvent) {
		if (mouseEvent.type === 'pointerdown') {
			console.log('movement click!');

			try {
				var coords = MapPositionHelper.pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY);
				coords = MapPositionHelper.localTilePosToGlobal(coords[0], coords[1]);

				console.log('GLOBAL POSITION CLICKED: ' + coords);

				SocketHandler.sendMovementCommand(coords[0], coords[1]);
			} catch (err) {
				//	Invalid tile position clicked on, do nothing
				console.log('MOVEMENT-COMMAND| ' + err);
			}
		}
	}

	showStatBars () {
		var statBars = this.setupStatBars();
		console.log(statBars);
		statBars[0].setValue(Session.clientSession.character.health);
		statBars[0].drawBackgroundBar(Map.thirdMapWindowSize, this.mapTileSize);
		statBars[0].drawInnerBar();
	}

	// Shows just the controls needed for login
	// Hiding all other controls
	showLoginControls () {
		PageView.hideWindows();
		//	Make the console only visisble
		PageView.toggleConsoleVisibility();
		//	Check connection every 5 seconds
		setTimeout(function () { return PageController.checkConnection(); }, 5000);
	}

	//	Show the main chat view
	showDialog () {
		PixiView.setDialogBackgroundVisibility(true);
		this.renderStage(); //	update the view to show this
	}

	showControls (show) {
		PixiMapView.controlsContainer.visisble = show;
		this.renderControlsContainer();
	}
}

// Create an instance we can refer to nicely (hide instanciation)
let PixiController = new PixiControllerClass();
export { PixiController };
