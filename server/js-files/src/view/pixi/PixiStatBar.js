import * as PIXI from 'libs/pixi.min.js';

class PixiStatBar {
	constructor (name, posX, posY, thirdMapWindowSize, tileSize) {
		this.name = name;
		this.posX = posX;
		this.posY = posY;

		this.backgroundBar = new PIXI.Graphics();
		this.innerBar = new PIXI.Graphics();

		this.innerSizeX = thirdMapWindowSize - 9;
		this.innerSizeY = tileSize / 3 - 6;
		this.value = 100;
	}

	drawBackgroundBar (thirdMapWindowSize, tileSize) {
		this.backgroundBar.beginFill(0x000000);
		this.backgroundBar.lineStyle(2, 0xFFFFFF, 1);

		this.backgroundBar = this.backgroundBar.drawRoundedRect(this.posX, this.posY, thirdMapWindowSize, tileSize / 2, 4);
		this.backgroundBar.endFill();
	}

	drawInnerBar () {
		let posPaddingPixels = 6;
		let sizePaddingPixels = 4;
		this.innerBar.beginFill(0xFF0000);

		this.innerBar = this.innerBar.drawRoundedRect(this.posX + posPaddingPixels,
			this.posY + posPaddingPixels,
			this.innerSizeX,
			this.innerSizeY, sizePaddingPixels);

		this.innerBar.endFill();
	}
	
	// Sets visisbility for all components
	setVisible(visisble){
		this.backgroundBar.visisble = visisble;
		this.innerBar.visisble = visisble;
	}

	//	Sets a statbar's indicated value using a 1-100 value
	//	Returns true if changes made, false otherwise
	setValue (value) {
		if (this.value === value) return false;

		if (value <= 100 && value >= 0) {
			this.value = value;
			this.innerSizeX = ((this.innerSizeX / 100) * value); //	Simple percentage adjustment for Y size
		} else return false;
	}
}

export { PixiStatBar };
