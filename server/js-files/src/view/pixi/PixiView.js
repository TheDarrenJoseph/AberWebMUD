// Top level Pixi View
//	Holds and generic Pixi View code / or code that's yet to be refactored
import PIXI from 'libs/pixi.min.js';

import SpriteHelper from 'src/helper/pixi/SpriteHelper.js';

import { PixiStatBar } from 'src/view/pixi/PixiStatBar.js';
import { Session } from 'src/model/Session.js';

// HTML 5 Canvas
const RENDERER_CANVAS = 'Canvas';
const RENDERER_WEBGL = 'WebGL';

export default class PixiView {
	constructor (windowSize) {
		// Ask the page view what our available space in the window is
		this.windowSize = windowSize;

		// Top level container for all children
		this.parentContainer = new PIXI.Container();
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
			if (pixiContainer instanceof PIXI.Container()) {
				//	Add any Container not already added, or log an error.
				if (this.parentContainer.getChildByName(pixiContainer.name) == null) {
					this.parentContainer.addChild(pixiContainer);
				} else {
					console.log('Attempt to add duplicate Container to the Pixi Stage. Ignoring.');
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
		renderer.autoresize = true;
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

		this.dialogBackground.beginFill(0xFFFFFF);
		this.dialogBackground.lineStyle(2, 0x000000, 1);
		this.dialogBackground.drawRect(halfMapWindowSize / 2, halfMapWindowSize / 2, halfMapWindowSize, halfMapWindowSize);
		this.dialogBackground.endFill();
		this.dialogBackground.visible = false; // Hidden until we need it

		this.dialogContainer.addChild(this.dialogBackground);
		this.dialogContainer.overflow = 'scroll';
	}

	//	Creates the needed stat bars
	//	Returns an array of these statbars for later adjustment
	setupStatBars (mapWindowSize) {
		let thirdMapWindowSize = Math.floor(mapWindowSize / 3);
		let healthBarPosX = mapWindowSize - thirdMapWindowSize - 2;
		let healthBarPosY = 0;
		var healthBar = new PixiStatBar('health-bar', healthBarPosX, healthBarPosY, thirdMapWindowSize, Map.mapTileSize);
	
		this.controlsContainer.addChild(healthBar.backgroundBar);
		this.controlsContainer.addChild(healthBar.innerBar);

		return [healthBar];
	}

	setDialogBackgroundVisibility (bool) {
		// Toggle dialogBackground Container visibility
		this.dialogBackground.visible = bool;
	}

	setHealthBarValue (health) {
		this.statBars[0].setValue(Session.ActiveSession.clientSession.characterDetails.health);
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
