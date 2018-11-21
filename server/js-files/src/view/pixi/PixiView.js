// Top level Pixi View
//	Holds and generic Pixi View code / or code that's yet to be refactored
import * as PIXI from 'libs/pixi.min.js';

import PixiMapView from 'src/view/pixi/PixiMapView.js';

import { PageView } from 'src/view/page/PageView.js';
import { PixiStatBar } from 'src/view/pixi/PixiStatBar.js';

export default class PixiView {
	constructor (windowSize) {
		// Ask the page view what our available space in the window is
		this.windowSize = PageView.getWindowDimensions();

		// Top level container for all children
		this.parentContainer = new PIXI.Container();
		this.dialogContainer = new PIXI.Container();
		this.controlsContainer = new PIXI.Container();
		this.parentContainer.addChild(this.dialogContainer, this.controlsContainer);

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

	// Because PixiJS has 2 types of renderer, WebGL and Canvas, check for both
	isPixiRenderer (renderer) {
		return (renderer instanceof PIXI.WebGLRenderer ||
						renderer instanceof PIXI.CanvasRenderer);
	}

	// Builds the one PixiJS Renderer to rule them all
	_buildRenderer () {
		let renderer = PIXI.autoDetectRenderer(this.windowSize, this.windowSize);
		renderer.autoresize = true;
		console.log('Created renderer: ' + renderer);

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

	getMapView () {
		return this.pixiMapView;
	}

	// Re-renders the parent container with all children
	renderAll () {
		this.renderer.render(this.parentContainer); // Re-renders the stage to show blank
	}

	renderDialogContainer () {
		this.renderer.render(this.dialogContainer);
	}

	renderControlsContainer () {
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
	setupStatBars (mapWindowSize, thirdMapWindowSize) {
		let healthBarPosX = mapWindowSize - thirdMapWindowSize - 2;
		let healthBarPosY = 0;
		var healthBar = new PixiStatBar('health-bar', healthBarPosX, healthBarPosY, thirdMapWindowSize, Map.mapTileSize);

		PixiMapView.controlsContainer.addChild(healthBar.backgroundBar);
		PixiMapView.controlsContainer.addChild(healthBar.innerBar);

		return [healthBar];
	}

	setDialogBackgroundVisibility (bool) {
		// Toggle dialogBackground Container visibility
		this.dialogBackground.visible = bool;
	}

	static createInventoryButton (tileAtlasPath, subtileName, mapWindowSize, tileSize) {
		return this.createSprite(zeldaObjectsAtlasPath,
		'chest-single',
		PixiMapView.tileSize,
		PixiMapView.tileSize * 2,
		mapWindowSize - (tileSize * 2),
		mapWindowSize - tileSize,
		true
		);
	}

	static createStatsButtont (zeldaObjectsAtlasPath) {
		return this.createSprite(zeldaObjectsAtlasPath,
		'chest-single',
		PixiMapView.tileSize,
		PixiMapView.tileSize * 2,
		PixiMapView.mapWindowSize - MapView.tileSize * 4,
		PixiMapView.mapWindowSize - MapView.tileSize,
		true
	);
	}

}

export { PixiView };
