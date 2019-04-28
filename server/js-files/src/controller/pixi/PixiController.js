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
import { DEFAULT_TILE_SIZE } from '../../model/pixi/map/MapModel'

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
class PixiController {
	constructor (windowSize, pageController) {
		this.SOCKET_HANDLER = SocketHandler.getInstance();

		this.isSetup   = false;
		this.uiEnabled = false;
		
		if (windowSize === undefined) {
			this.windowSize = 500;
		} else {
			this.windowSize = windowSize;
		}

		this.tileSize = DEFAULT_TILE_SIZE;

		console.log('Pixi - Window Size: ' + this.windowSize + 'px ^ 2');

		this.pageController = pageController;
		this.pixiView = new PixiView(windowSize, this.tileSize);
		this.renderer = this.pixiView.getRenderer();

		this.mapController = new MapController(this.renderer, undefined, PageView.getWindowDimensions(), this.tileSize, undefined, ASSET_PATHS);

		// Ensure we add the sub-container to the parent PIXI.Container
		let pixiMapContainer = this.mapController.getPixiMapView().getParentContainer();
		this.pixiView.addContainers(pixiMapContainer);

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
			consoleButtonSprite.on('click', this.pageController.pageView.toggleConsoleVisibility);
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

		contextButtons[0].on('click', this.pageController.pageView.toggleIventoryWinVisibility);
		contextButtons[1].on('click', this.pageController.pageView.toggleStatWinVisibility);

		this.pageController.pageView.appendToConsoleButtonClass(contextButtons);

		this.initialiseAssets();
	}

	enableUI () {
		if (!this.isSetup) {
			this.setupUI();
			this.isSetup = true;
		}
		
		if (!this.uiEnabled) {
			this.pageController.getPageChatView().clearMessageLog();
			this.pageController.getPageChatView().hidePasswordInput();

			// Set the stat bar values before we render
			this.pixiView.setHealthBarValue(Session.ActiveSession.clientSession.player.getCharacter().health);

			this.pixiView.showStatBars();
			this.showControls(true);
			this.renderAll();

			this.uiEnabled = true;
		}
	}

	disableUI () {
		if (this.uiEnabled) {
			this.pageController.getPageChatView().clearMessageLog();
			this.pageController.getPageChatView().hidePasswordInput();
			//this.pageController.pageView.hideWindows();

			// Show the initial dialog
			this.pageController.pageView.showDialog();

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
		this.pageController.pageView.appendToMainWindow(this.renderer.view);
		this.showLoginControls();
	}

	/**
	 * For pre-loading needed assets
	 */
	initialiseAssets () {
		// Ensure our atlasses are loaded
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_OVERWORLD);
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_ZELDA_OBJECTS);
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_CHARACTERS);

		console.log('WARNING - PixiController multi-asset loading unimplemented!');
		// TODO Potentially pre-load all assets
		// 1. Pass the 3 atlasses into AtlasHelper
		// 2. pass assetsLoaded in as a callback
		// 		this.assetsLoaded.apply(this);

		this.assetsLoaded();
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

				this.SOCKET_HANDLER.sendMovementCommand(coords[0], coords[1]);
			} catch (err) {
				//	Invalid tile position clicked on, do nothing
				console.log('MOVEMENT-COMMAND| ' + err);
			}
		}
	}

	// Hide everything if we lose connection
	checkConnection () {
		let socketHandler = SocketHandler.getInstance();

		if (!socketHandler.isSocketConnected()) {
			console.log('Connection lost to server! Hiding view..');

			this.pageController.getPageChatView().updateMessageLog('Connection lost to server!', 'client');
			this.disableUI();
		} else {
			this.enableUI();
		}
	}

	// Shows just the controls needed for login
	// Hiding all other controls
	showLoginControls () {
		//this.pageController.pageView.hideWindows();
		//	Make the console only visisble
		this.pageController.pageView.toggleConsoleVisibility();
		//	Check connection every 5 seconds
		setTimeout(() => {
			this.checkConnection.apply(this)
		}, 5000);
	}

	//	Show the main chat view
	showDialog () {
		this.pixiView.showDialogContainer(true);
	}

	showControls (show) {
		this.pixiView.showControlsContainer(true);
	}

	renderAll () {
		this.pixiView.renderAll();
	}

}

// Create an instance we can refer to nicely (hide instanciation)
//let PixiController = new PixiControllerClass(PageView.getWindowDimensions());
export { PixiController };
