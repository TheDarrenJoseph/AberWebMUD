// Central controller for Pixi Views

// Default imports
import SocketHandler from 'src/handler/socket/SocketHandler.js';
import MapPositionHelper from 'src/helper/MapPositionHelper.js';
// Named imports
import { MapController } from 'src/controller/MapController.js';
import { Session } from 'src/model/Session.js';
import { PageView } from 'src/view/page/PageView.js';
import { DEFAULT_TILE_SIZE } from 'src/model/pixi/map/MapModel.js';
import { PixiView } from 'src/view/pixi/PixiView.js';
import { CONSOLE_BUTTON_NAME, INVENTORY_BUTTON_NAME, STATS_BUTTON_NAME } from 'src/view/pixi/PixiView.js'

// import { ValidationHandler } from 'src/handler/ValidationHandler.js';

// Main Pixi handling point
//	App Constants
const rootUrl = window.location.origin;
const assetPathZelda = rootUrl + '/static/assets/gfx/';
const assetPathOverworld = assetPathZelda + 'overworld-texture-atlas.json';
const assetPathOverworldGrass = assetPathZelda + 'overworld-grass-texture-atlas.json';
const assetPathCharacters = assetPathZelda + 'character-texture-atlas.json';
const assetPathObjects = assetPathZelda + 'zelda-objects-texture-atlas.json';

export const ASSET_PATHS = {
	ASSET_PATH_OVERWORLD: assetPathOverworld,
	ASSET_PATH_OVERWORLD_GRASS: assetPathOverworldGrass,
	ASSET_PATH_CHARACTERS: assetPathCharacters,
	ASSET_PATH_OBJECTS: assetPathObjects
};

//	Handles the PixiJS renderer
class PixiController {
	constructor (windowSize) {
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

		//this.pageController = pageController;
		this.pixiView = new PixiView(windowSize, this.tileSize, ASSET_PATHS);
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

	getPixiView() {
		return this.pixiView;
	}

	getMapController () {
		return this.mapController;
	}

	setupUI() {
		return new Promise((resolve, reject) => {
			if (!this.isSetup) {
				this.pixiView.setupUI().then(() => {
					console.log('Pixi View Setup. Using renderer option: ' + this.pixiView.getRendererType());
					this.isSetup = true;
					this.pixiView.hideStatBars();
					this.pixiView.hideContextControl(CONSOLE_BUTTON_NAME);
					this.pixiView.hideContextControl(STATS_BUTTON_NAME);
					this.pixiView.hideContextControl(INVENTORY_BUTTON_NAME);

					this.pixiView.setHealthBarValue(Session.ActiveSession.getPlayer().getMapCharacter().health);

					this.pixiView.showParentContainer(true);

					this.renderAll();

					resolve(this.renderer.view);
				}).catch(reject);
			} else {
				resolve(this.renderer.view);
			}
		});
	}

	/**
	 * Idempotently creates/enables the UI
	 * Then shows / enables various view components considered default to the running game
	 *
	 * @returns a Promise that should resolve to the main Renderer View Element (HTMLCanvasElement)
	 */
	enableUI () {
		return new Promise( (resolve, reject) => {
			this.setupUI().then(() => {

				if (!this.uiEnabled) {
					// Set the stat bar values before we render
					this.pixiView.showStatBars();
					this.pixiView.showContextControl(CONSOLE_BUTTON_NAME);
					this.pixiView.showContextControl(STATS_BUTTON_NAME);
					this.pixiView.showContextControl(INVENTORY_BUTTON_NAME);

					this.renderAll();

					this.uiEnabled = true;
				}

				resolve(this.renderer.view);
			}).catch(reject);
		});
	}

	disableUI () {
		if (this.uiEnabled) {
			//this.pageController.pageView.hideElements();

			// Show the initial dialog
			//this.pageController.pageView.showDialog();

			this.pixiView.hideStatBars();
			this.pixiView.showControls(false);
			this.renderAll();

			this.uiEnabled = false;
		}
	}
	
	isUIEnabled () {
		return this.uiEnabled;
	}

	// Sets the timeout trigger for a double-click
	stageClicked () {

		let renderer = this.renderer;

		if (renderer !== undefined) {
			var mouseEvent = renderer.plugins.interaction.pointer.originalEvent;
			//	console.log(pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY));
			setTimeout(function () { return this.stageDoubleClicked(mouseEvent); }, 150);
		}
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

			//this.pageController.getPageChatView().updateMessageLog('Connection lost to server!', 'client');
			this.disableUI();
		} else {
			this.enableUI();
		}
	}

	// Shows just the controls needed for login
	// Hiding all other controls
	showLoginControls () {
		//this.pageController.pageView.hideElements();
		//	Make the console only visisble
		//this.pageController.pageChatView.toggleConsoleVisibility();
		//	Check connection every 5 seconds
		setTimeout(() => {
			this.checkConnection.apply(this)
		}, 5000);
	}

	//	Show the main chat view
	showDialog () {
		this.pixiView.showDialogContainer(true);
	}

	renderAll () {
		this.pixiView.renderAll();
	}

}

export { PixiController };
