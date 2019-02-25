// Central controller for Pixi Views
import AtlasHelper from 'src/helper/pixi/AtlasHelper.js';

// Default imports
import PageChatView from 'src/view/page/PageChatView.js';
import SocketHandler from 'src/handler/socket/SocketHandler.js';
import SpriteHelper from 'src/helper/pixi/SpriteHelper.js';
import MapPositionHelper from 'src/helper/MapPositionHelper.js';
import PixiView from 'src/view/pixi/PixiView.js';
import PixiMapView from 'src/view/pixi/PixiMapView.js';

// Named imports
import { MapController } from 'src/controller/MapController.js';
import { Session } from 'src/model/Session.js';
import { PageView } from 'src/view/page/PageView.js';

// import { ValidationHandler } from 'src/handler/ValidationHandler.js';

// Main Pixi handling point
//	App Constants
export const titleText = 'AberWebMUD';

const rootUrl = window.location.origin;
const assetPathZelda = rootUrl + '/static/assets/gfx/';
const assetPathOverworld = assetPathZelda + 'overworld-texture-atlas.json';
const assetPathOverworldGrass = assetPathZelda + 'overworld-grass-texture-atlas.json';
const assetPathCharacters = assetPathZelda + 'character-texture-atlas.json';
const assetPathObjects = assetPathZelda + 'zelda-objects-texture-atlas.json';

const CONSOLE_BUTTON_NAME = 'consoleButtonSprite';
const INVENTORY_BUTTON_NAME = 'inventoryButtonSprite';
const STATS_BUTTON_NAME = 'statsButtonSprite';

export const ASSET_PATHS = {
	ASSET_PATH_OVERWORLD: assetPathOverworld,
	ASSET_PATH_OVERWORLD_GRASS: assetPathOverworldGrass,
	ASSET_PATH_CHARACTERS: assetPathCharacters,
	ASSET_PATH_OBJECTS: assetPathObjects
};

//	Handles the PixiJS renderer
class PixiControllerClass {
	constructor (windowSize) {
		this.isSetup   = false;
		this.uiEnabled = false;

		this.windowSize = windowSize;
		this.pixiView = new PixiView(this.windowSize);

		this.renderer = this.pixiView.getRenderer();

		this.mapController = new MapController(this.renderer, undefined, PageView.getWindowDimensions(), null, ASSET_PATHS);
		
		// resolution 1 for now as default (handles element scaling)
		//	this.renderingOptions = {
		//	resolution: 1
		//	};
	}

	getMapController () {
		return this.mapController;
	}

	async setupConsoleButton () {
		if (this.pixiView.controlsContainer.getChildByName('consoleButtonSprite') == undefined) {
			console.log('Creating a console button..');
			var mapTileSize = this.mapController.getPixiMapView().tileSize;
			var consoleButtonSprite = await SpriteHelper.makeSpriteFromAtlas(ASSET_PATHS.ASSET_PATH_OBJECTS, 'chat-bubble-blank');
			consoleButtonSprite.name = CONSOLE_BUTTON_NAME;
			this.pixiView.controlsContainer.addChild(consoleButtonSprite);
			consoleButtonSprite.on('click', this.pageView.toggleConsoleVisibility);
		}
	}

	async setupContextButtons () {

		let contextButtons = [];

		var mapTileSize = this.mapController.getPixiMapView().windowSize;

		let inventoryButtonSprite = this.pixiView.controlsContainer.getChildByName(INVENTORY_BUTTON_NAME);
		if (inventoryButtonSprite == undefined) {
			console.log('Creating a context button..');
			inventoryButtonSprite = await PixiView.createInventoryButton(ASSET_PATHS.ASSET_PATH_OBJECTS, 'chest-single', this.windowSize, mapTileSize);
			inventoryButtonSprite.name = INVENTORY_BUTTON_NAME;
			this.pixiView.controlsContainer.addChild(inventoryButtonSprite);
		}
		contextButtons[0] = inventoryButtonSprite;

		let statsButtonSprite = this.pixiView.controlsContainer.getChildByName(STATS_BUTTON_NAME);
		if (this.pixiView.controlsContainer.getChildByName('statsButtonSprite') == undefined) {
			console.log('Creating a inventory button..');
			statsButtonSprite = await PixiView.createStatsButton(ASSET_PATHS.ASSET_PATH_OBJECTS, 'chest-single', this.windowSize, mapTileSize);
			inventoryButtonSprite.name = STATS_BUTTON_NAME;
			this.pixiView.controlsContainer.addChild(statsButtonSprite);
		}
		contextButtons[1] = statsButtonSprite;

		return contextButtons;
	}

	// UI Building
	async setupUI () {
		this.setupConsoleButton();

		// Await all setup
		var contextButtons = await this.setupContextButtons();

		contextButtons[0].on('click', this.pageView.toggleIventoryWinVisibility);
		contextButtons[1].on('click', this.pageView.toggleStatWinVisibility);

		this.pageView.appendToConsoleButtonClass(contextButtons);

		this.initialiseAssets();
	}

	enableUI () {
		if (!this.isSetup) {
			this.setupUI();
		}
		
		if (!this.uiEnabled) {
			PageChatView.clearMessageLog();
			PageChatView.hidePasswordInput();

			// Set the stat bar values before we render
			this.pixiView.setHealthBarValue(Session.clientSession.character.health);

			this.pixiView.showStatBars();
			this.showControls(true);
			this.renderAll();

			this.uiEnabled = true;
		}
	}

	disableUI () {
		if (this.uiEnabled ) {
			PageChatView.clearMessageLog();
			PageChatView.hidePasswordInput();

			this.pixiView.hideStatBars();
			this.showControls(false);
			this.renderAll();

			this.uiEnabled = false;
		}
	}
	
	isUIEnabled () {
		return this.uiEnabled;
	}

	assetsLoaded () {
		console.log(this);
		console.log('Using renderer option: ' + this.pixiView.getRendererType());
		this.pageView.appendToMainWindow(this.renderer.view);
		this.showLoginControls();
	}

	initialiseAssets () {
		// Ensure our atlasses are loaded
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_OVERWORLD);
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_ZELDA_OBJECTS);
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_CHARACTERS);

		console.log('WARNING - PixiController multi-asset loading unimplemented!');
		// TODO
		// 1. Pass the 3 atlasses into AtlasHelper
		// 2. pass assetsLoaded in as a callback
		// 		this.assetsLoaded.apply(this);
	}

	// Sets the timeout trigger for a double-click
	stageClicked () {
		var mouseEvent = this.renderer.plugins.interaction.pointer.originalEvent;
		//	console.log(pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY));
		setTimeout(function () { return this.stageDoubleClicked(mouseEvent); }, 150);
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
		this.pageView.hideWindows();
		//	Make the console only visisble
		this.pageView.toggleConsoleVisibility();
		//	Check connection every 5 seconds
		setTimeout(function () { return this.checkConnection(); }, 5000);
	}

	//	Show the main chat view
	showDialog () {
		this.pixiView.showDialogContainer(true);
	}

	showControls (show) {
		this.pixiView.showControlsContainer(true);
	}

	renderAll () {
		// this.pixiView.renderAll();
	}

	// Hide everything if we lose connection
	checkConnection () {
		if (!SocketHandler.isSocketConnected()) {
			PageView.hideWindows();
			PixiController.showControls(false);
			PageView.showDialog();
			PageChatView.updateMessageLog('Connection lost to server!', 'client');
		}
	}
}

// Create an instance we can refer to nicely (hide instanciation)
let PixiController = new PixiControllerClass(PageView.getWindowDimensions());
export { PixiController, PixiControllerClass };
