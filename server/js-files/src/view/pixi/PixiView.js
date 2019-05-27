// Top level Pixi View
//	Holds and generic Pixi View code / or code that's yet to be refactored
import { EventMapping } from 'src/helper/EventMapping.js';
import PIXI from 'libs/pixi.min.js';

import SpriteHelper from 'src/helper/pixi/SpriteHelper.js';

import { PixiStatBar } from 'src/view/pixi/PixiStatBar.js';
import { Session } from 'src/model/Session.js';

const CONSOLE_BUTTON_NAME = 'consoleButtonSprite';
const INVENTORY_BUTTON_NAME = 'inventoryButtonSprite';
const STATS_BUTTON_NAME = 'statsButtonSprite';

// HTML 5 Canvas
const RENDERER_CANVAS = 'Canvas';
const RENDERER_WEBGL = 'WebGL';

export const EVENTS = { 	CONSOLE_BUTTONCLICK : 'console_buttonclick',
								INVENTORY_BUTTONCLICK : 'inventory_buttonclick',
								STATS_BUTTONCLICK : 'stats_buttonclick'
};

export default class PixiView extends EventMapping {
	constructor (windowSize=500, tileSize=80, ASSET_PATHS) {
		super();

		this.assetPaths = ASSET_PATHS;
		this.objectAssets = this.assetPaths.ASSET_PATH_OBJECTS;

		// Ask the page view what our available space in the window is
		this.windowSize = windowSize;
		this.halfWindowSize = Math.floor(this.windowSize / 2);
		this.tileSize = tileSize;

		// Top level container for all children
		this.parentContainer = new PIXI.Container();
		this.parentContainer.height = windowSize;
		this.parentContainer.width = windowSize;

		this.dialogContainer = new PIXI.Container();
		this.controlsContainer = new PIXI.Container();
		this.parentContainer.addChild(this.dialogContainer, this.controlsContainer);

		this.statBars = this.setupStatBars();
		this.setupDialogWindow();
	}

	// Adds containers to the view's parent container
	// All containers should end up under this parent
	addContainers (...pixiContainers) {
		for (let pixiContainer of pixiContainers) {
			if (pixiContainer instanceof PIXI.Container) {
				//	Add any Container not already added, or log an error.
				if (this.parentContainer.getChildByName(pixiContainer.name) == null) {
					this.parentContainer.addChild(pixiContainer);
				} else {
					console.log('Attempt to add duplicate Container ' + pixiContainer.name + ' to the Pixi Stage. Ignoring');
				}
			} else {
				console.log('Attempt to add non-Container to the Pixi Stage! (Expected PIXI.Container).');
			}
		}
	}
	
	showParentContainer(show) {
		this.parentContainer.visible = show;
		this.renderAll();
	}
	
	showDialogContainer(show) {
		this.dialogContainer.visible = show;
		this.renderDialogContainer();
	}
	
	showControlsContainer(show) {
		this.controlsContainer.visible = show;
		this.renderControlsContainer();
	}

	// Because PixiJS has 2 types of renderer, WebGL and Canvas, check for both
	isPixiRenderer (renderer) {
		return (renderer instanceof PIXI.WebGLRenderer ||
						renderer instanceof PIXI.CanvasRenderer);
	}

	getRendererType () {
		let rendererType = RENDERER_CANVAS;
		// Check that WebGL is supported and that we've managed to use it
		if (PIXI.utils.isWebGLSupported() && (this.renderer instanceof PIXI.WebGLRenderer)) {
			rendererType = RENDERER_WEBGL;
		}

		return rendererType;
	}

	// Builds the one PixiJS Renderer to rule them all
	_buildRenderer () {
		let renderer = PIXI.autoDetectRenderer(this.windowSize, this.windowSize);
		renderer.autoresize = false;
		renderer.backgroundColor = 0x000000;
		renderer.view.id = 'pixi-renderer'
		return renderer;
	}

	// There should only be one renderer, so we'll manage it here
	getRenderer () {
		if (!this.isPixiRenderer(this.renderer)) {
			this.renderer = this._buildRenderer();
		}

		return this.renderer;
	}

	getParentContainer () {
		return this.parentContainer;
	}

	// Re-renders the parent container with all children
	renderAll () {
		console.log('PixiView - rendering all in parent container.. ');
		this.renderer.render(this.parentContainer); // Re-renders the stage to show blank
	}

	renderDialogContainer () {
		console.log('PixiView - rendering dialog container.. ');
		this.renderer.render(this.dialogContainer);
	}

	renderControlsContainer () {
		console.log('PixiView - rendering controls container.. ');
		this.renderer.render(this.controlsContainer); // Re-renders the stage to show blank
	}

	setupDialogWindow (halfMapWindowSize) {
		this.dialogBackground = new PIXI.Graphics();

		let quarterWindowSize = this.halfWindowSize / 2;

		this.dialogBackground.beginFill(0xFFFFFF);
		this.dialogBackground.lineStyle(2, 0x000000, 1);
		this.dialogBackground.drawRect(quarterWindowSize, quarterWindowSize, this.halfMapWindowSize, this.halfMapWindowSize);
		this.dialogBackground.endFill();
		this.dialogBackground.visible = false; // Hidden until we need it

		this.dialogContainer.addChild(this.dialogBackground);
		this.dialogContainer.overflow = 'scroll';
	}

	//	Creates the needed stat bars
	//	Returns an array of these statbars for later adjustment
	setupStatBars () {
		let thirdMapWindowSize = Math.floor(this.windowSize / 3);
		let healthBarPosX = this.windowSize - thirdMapWindowSize - 2;
		let healthBarPosY = 0;

		var healthBar = new PixiStatBar('health-bar', healthBarPosX, healthBarPosY, thirdMapWindowSize, this.tileSize);
	
		this.controlsContainer.addChild(healthBar.backgroundBar);
		this.controlsContainer.addChild(healthBar.innerBar);

		return [healthBar];
	}


	async setupConsoleButton () {
		if (this.controlsContainer.getChildByName(CONSOLE_BUTTON_NAME) == undefined) {
			console.log('Creating a console button..');
			this.consoleButtonSprite  = await SpriteHelper.makeSpriteFromAtlas(this.objectAssets, 'chat-bubble-blank', this.windowSize, this.tileSize);

			this.consoleButtonSprite.name = CONSOLE_BUTTON_NAME;
			this.controlsContainer.addChild(this.consoleButtonSprite);

			this.consoleButtonSprite.on('click', this.emit(EVENTS.CONSOLE_BUTTONCLICK));
		}
	}

	async setupContextButtons () {
		if (this.controlsContainer.getChildByName(INVENTORY_BUTTON_NAME) == undefined) {
			console.log('Creating a context button..');
			this.inventoryButtonSprite = await PixiView.createInventoryButton(this.objectAssets, 'chest-single', this.windowSize, this.tileSize);
			this.inventoryButtonSprite.name = INVENTORY_BUTTON_NAME;
			this.controlsContainer.addChild(this.inventoryButtonSprite);
			this.inventoryButtonSprite.on('click', this.emit(EVENTS.INVENTORY_BUTTONCLICK));
		}

		if (this.controlsContainer.getChildByName(STATS_BUTTON_NAME) == undefined) {
			console.log('Creating a inventory button..');
			this.statsButtonSprite = await PixiView.createStatsButton(this.objectAssets, 'chest-single', this.windowSize, this.tileSize);
			this.statsButtonSprite.name = STATS_BUTTON_NAME;
			this.controlsContainer.addChild(this.statsButtonSprite);
			this.statsButtonSprite.on('click', this.emit(EVENTS.STATS_BUTTONCLICK));
		}
	}

	/**
	 * For pre-loading needed assets later
	 */
	initialiseAssets () {
		// Ensure our atlasses are loaded
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_OVERWORLD);
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_ZELDA_OBJECTS);
		// AtlasHelper.loadAtlas(ASSET_PATHS.ASSET_PATH_CHARACTERS);

		console.log('WARNING - Pixi multi-asset pre-loading unimplemented!');
		// TODO Potentially pre-load all assets
		// 1. Pass the 3 atlasses into AtlasHelper
		// 2. pass assetsLoaded in as a callback
		// 		this.assetsLoaded.apply(this);
	}

	// UI Building
	async setupUI () {
		// Await all setup
		await this.setupConsoleButton();
		await this.setupContextButtons();
		await this.initialiseAssets();
	}

	setDialogBackgroundVisibility (bool) {
		// Toggle dialogBackground Container visibility
		this.dialogBackground.visible = bool;
	}

	setHealthBarValue (health) {
		this.statBars[0].setValue(Session.ActiveSession.clientSession.player.getCharacter().health);
		this.statBars[0].drawInnerBar();
	}

	showStatBars () {
		console.log(this.statBars);
		this.statBars[0].setValue(0);
		this.statBars[0].drawBackgroundBar(Map.thirdMapWindowSize, this.mapTileSize);
		this.statBars[0].drawInnerBar();
		this.statBars[0].setVisible(true);
	}
	
	hideStatBars() {
		this.statBars[0].setVisible(false);
	}

	static async createInventoryButton (tileAtlasPath, subtileName, mapWindowSize, tileSize) {
		let pixiPos = new PIXI.Point(mapWindowSize - (tileSize * 2), mapWindowSize - tileSize);
		
		return SpriteHelper.makeSpriteFromAtlas(tileAtlasPath,
		subtileName,
		tileSize,
		tileSize * 2,
		pixiPos,
		true);
	}

	static async createStatsButton (tileAtlasPath, subtileName, mapWindowSize, tileSize) {
		let pixiPos = new PIXI.Point(mapWindowSize - (tileSize * 4), mapWindowSize - tileSize);
		
		return SpriteHelper.makeSpriteFromAtlas(tileAtlasPath,
		subtileName,
		tileSize,
		tileSize * 2,
		pixiPos,
		true);
	}
}

export { PixiView };
