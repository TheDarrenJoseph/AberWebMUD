// Central controller for Pixi Views
import AtlasHelper from 'src/helper/pixi/AtlasHelper.js';

// Default imports
import PageChatView from 'src/view/page/PageChatView.js';
import SocketHandler from 'src/handler/socket/SocketHandler.js';
import PageController from 'src/controller/PageController.js';
import SpriteHelper from 'src/helper/pixi/SpriteHelper.js';
import MapPositionHelper from 'src/helper/MapPositionHelper.js';
import PixiView from 'src/view/pixi/PixiView.js';
import PixiMapView from 'src/view/pixi/PixiMapView.js';

// Named imports
import { MapController } from 'src/controller/MapController.js';
import { Session } from 'src/model/SessionModel.js';
import { PageView } from 'src/view/page/PageView.js';

// import { ValidationHandler } from 'src/handler/ValidationHandler.js';

// Main Pixi handling point
//	App Constants
export const titleText = 'AberWebMUD';

const rootUrl = window.location.origin;
const assetPathZelda = rootUrl + '/static/assets/gfx/';
const assetPathOverworld = assetPathZelda + 'overworld-texture-atlas.json';
const assetPathCharacters = assetPathZelda + 'character-texture-atlas.json';
const assetPathObjects = assetPathZelda + 'zelda-objects-texture-atlas.json';

export const ASSET_PATHS = {
	ASSET_PATH_OVERWORLD : assetPathOverworld,
	ASSET_PATH_CHARACTERS: assetPathCharacters,
	ASSET_PATH_OBJECTS: assetPathCharacters
}

//	Handles the PixiJS renderer
class PixiControllerClass {
	constructor () {
		this.windowSize = PageView.getWindowDimensions();
		this.pixiView = new PixiView(this.windowSize);
		
		this.renderer = this.pixiView.getRenderer();

		this.mapController = new MapController(this.renderer, undefined, null, ASSET_PATHS);

		// resolution 1 for now as default (handles element scaling)
		//	this.renderingOptions = {
		//	resolution: 1
		//	};
	}

	setupConsoleButton () {
		var mapTileSize = this.mapController.getPixiMapView().tileSize;

		var consoleButtonSprite = SpriteHelper.createSprite(ASSET_PATHS.ASSET_PATH_ZELDA_OBJECTS,
																						'chat-bubble-blank',
																						mapTileSize,
																						mapTileSize,
																						0,
																						this.windowSize - mapTileSize,
																						true);

		PixiMapView.controlsContainer.addChild(consoleButtonSprite);
		consoleButtonSprite.on('click', PageView.toggleConsoleVisibility);
	}

	setupContextButtons () {
		var mapTileSize = this.mapController.getPixiMapView().windowSize;

		//	var inventoryButtonSprite = makeSpriteFromTileset(zeldaObjectsTilesetPath, 0, 0, 16, 16);
		var inventoryButtonSprite = this.pixiView.createInventoryButton(ASSET_PATHS.ASSET_PATH_ZELDA_OBJECTS, 'chest-single', this.windowSize, mapTileSize);
		PixiMapView.controlsContainer.addChild(inventoryButtonSprite);

		var statsButtonSprite = this.pixiView.createStatsButton(ASSET_PATHS.ASSET_PATH_ZELDA_OBJECTS, 'chest-single', this.windowSize, mapTileSize);
		PixiMapView.controlsContainer.addChild(statsButtonSprite);

		return [inventoryButtonSprite, statsButtonSprite];
	}

	setupUI () {
		// Set the health bar value
		this.pixiView.setHealthBarValue(Session.clientSession.character.health);
		// Show the stat bar
		this.pixiView.showStatBars();
		this.setupConsoleButton();
		var contextButtons = this.setupContextButtons();
		contextButtons[0].on('click', PageView.toggleIventoryWinVisibility);
		contextButtons[1].on('click', PageView.toggleStatWinVisibility);
		PageView.appendToConsoleButtonClass(contextButtons);
		
		PageChatView.clearMessageLog();
		PageChatView.hidePasswordInput();
		this.initialiseAssets();
	}

	assetsLoaded () {
		console.log(this);
		console.log('Using renderer option: ' + this.pixiView.getRendererType());
		PageView.appendToMainWindow(this.renderer.view);
		this.showLoginControls();
	}
	
	initialiseAssets () {
		// Ensure our atlasses are loaded
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_OVERWORLD);
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_ZELDA_OBJECTS);
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_CHARACTERS);
		
		console.log('PixiController multi-asset loading unimplemented!');
		// TODO 
		// 1. Pass the 3 atlasses into AtlasHelper
		// 2. pass assetsLoaded in as a callback
		// 		this.assetsLoaded.apply(this);
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
		this.pixiView.setDialogBackgroundVisibility(true);
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
