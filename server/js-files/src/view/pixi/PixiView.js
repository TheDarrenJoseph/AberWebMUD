//	Holds and generic Pixi View code / or code that's yet to be refactored
import * as PIXI from 'libs/pixi.min.js';

import { PixiStatBar } from 'src/view/pixi/PixiStatBar.js';
import { PixiMapView } from 'src/view/pixi/PixiMapView.js';

import { MapModel } from 'src/model/pixi/MapModel.js';

class PixiViewClass {
	setupDialogWindow (halfMapWindowSize) {
		this.dialogBackground = new PIXI.Graphics();

		this.dialogBackground.beginFill(0xFFFFFF);
		this.dialogBackground.lineStyle(2, 0x000000, 1);
		this.dialogBackground.drawRect(halfMapWindowSize / 2, halfMapWindowSize / 2, halfMapWindowSize, halfMapWindowSize);
		this.dialogBackground.endFill();
		this.dialogBackground.visible = false; // Hidden until we need it

		PixiMapView.dialogContainer.addChild(this.dialogBackground);
		PixiMapView.ddialogContainer.overflow = 'scroll';
	}

	//	Creates the needed stat bars
	//	Returns an array of these statbars for later adjustment
	setupStatBars (mapWindowSize, thirdMapWindowSize) {
		let healthBarPosX = mapWindowSize - thirdMapWindowSize - 2;
		let healthBarPosY = 0;
		var healthBar = new PixiStatBar('health-bar', healthBarPosX, healthBarPosY, thirdMapWindowSize, MapModel.mapTileSize);

		PixiMapView.controlsContainer.addChild(healthBar.backgroundBar);
		PixiMapView.controlsContainer.addChild(healthBar.innerBar);

		return [healthBar];
	}

	setDialogBackgroundVisibility (bool) {
		// Toggle dialogBackground Container visibility
		this.dialogBackground.visible = bool;
	}
}

var pixiView = new PixiViewClass();
export { pixiView as PixiView };
