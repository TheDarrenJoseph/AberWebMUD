import * as PIXI from 'libs/pixi.min-4-3-5.js';
import { SpriteHelper } from 'src/helper/pixi/SpriteHelper.js';
import { PositionHelper } from 'src/helper/PositionHelper.js';
import { GridCharacter } from 'src/model/pixi/GridCharacter.js';

class PixiMapViewClass {
	constructor () {
		this.setupWindowDimensions();
	}

	// Set default window size
	setupWindowDimensions () {
		// Set our mapWindowSize to the smallest of our page dimensions
		// Using the smallest dimension to get a square
		// Then use 90% of this value to leave some space
		this.mapWindowSize = window.innerWidth;

		if (window.innerHeight < window.innerWidth) {
			this.mapWindowSize = window.innerHeight;
		}
	}

	setupPixiContainers (tileCount) {
		this.stage = new PIXI.Container();
		this.dialogContainer = new PIXI.Container();
		this.controlsContainer = new PIXI.Container();

		// Using ParticleContainer for large amounts of sprites
		this.mapContainer = new PIXI.ParticleContainer();
		this.characterContainer = new PIXI.ParticleContainer();

		//	Sprites for the map view
		this.tileSpriteArray = null;
		//	Sprites for the players in the current map view
		this.mapCharacterArray = this.createMapCharacterArray(tileCount);

		//	Add everything to the stage
		this.stage.addChild(this.mapContainer, this.dialogContainer, this.controlsContainer, this.characterContainer);
	}

	//	Creates an empty 2D array to store players in our view
	createMapCharacterArray (tileCount) {
		console.log('Tilecount: ' + tileCount);
		var mapCharacterArray = Array(tileCount);
		for (var x = 0; x < tileCount; x++) {
			mapCharacterArray[x] = Array(tileCount); // 2nd array dimension per row
		}

		return mapCharacterArray;
	}

	addToStage (...pixiContainers) {
		for (let pixiContainer of pixiContainers) {
			if (pixiContainer instanceof PIXI.Container()) {
				//	Add any Container not already added, or log an error.
				if (this.stage.getChildByName(pixiContainer.name) == null) {
					this.stage.addChild(pixiContainer);
				} else {
					console.log('Attempt to add duplicate Container to the Pixi Stage. Ignoring.');
				}
			} else {
				console.log('Attempt to add non-Container to the Pixi Stage! (Expected PIXI.Container).');
			}
		}
	}

	//	Calculate and assign pixel and tile sizes
	setupCalculateMapWindowDimensions () {
		// Set our mapWindowSize to the smallest of our page dimensions
		// Using the smallest dimension to get a square
		// Then use 90% of this value to leave some space
		this.mapWindowSize = window.innerWidth;

		if (window.innerHeight < window.innerWidth) {
			this.mapWindowSize = window.innerHeight;
		}
	}

	//	Creates a character sprite on-the-fly to represent another character
	//	gridX, gridY are character positions on the map
	newCharacterOnMap (characterAtlasPath, charactername, gridX, gridY) {
		console.log('new char.. ' + charactername + gridX + gridY);

		if (!PositionHelper.isPositionInOverworld(gridX, gridY)) {
			console.log('bad pos: ' + gridX + ' ' + gridY);
			return false; //	Do nothing if the coordinates don't exist on the map
		} else {
			//	Convert global co-ords to local view ones so we can modify the UI
			var localPos = PositionHelper.globalTilePosToLocal(gridX, gridY);
			var localX = localPos[0];
			var localY = localPos[1];

			if (PositionHelper.isPositionRelativeToView(localX, localY)) {
				var characterSprite = SpriteHelper.makeSpriteFromAtlas(characterAtlasPath, 'player');
				var pixiPos = PositionHelper.tileCoordToPixiPos(localX, localY);

				console.log('PIXI POS for new char: ' + pixiPos[0] + ' ' + pixiPos[1]);
				characterSprite.x = pixiPos[0];
				characterSprite.y = pixiPos[1];

				this.mapCharacterArray[localX][localY] = new GridCharacter(charactername, gridX, gridY, characterSprite);
				return characterSprite;
			} else {
				console.log('New player not in our view at this position: ' + gridX + ' ' + gridY);
			}

			return false;
		}
	}

	setupMapUI (overworldAtlasPath, tileCount, tileSize) {
		// Create a pretty crappy 2d array of tileCount size
		var tileSpriteArray = Array(tileCount);
		for (var x = 0; x < tileCount; x++) {
			tileSpriteArray[x] = Array(tileCount); // 2nd array dimension per row
			for (var y = 0; y < tileCount; y++) {
				// Create a new Pixi Sprite
				var tileSprite = SpriteHelper.makeSpriteFromAtlas(overworldAtlasPath, 'grass-plain');
				tileSprite.position.x = x * tileSize;
				tileSprite.position.y = y * tileSize;
				tileSprite.interactive = true;
				tileSprite.interactive = true;
				tileSprite.name = '' + x + '' + y;

				//	allocate it to the tileSpriteArray
				tileSpriteArray[x][y] = tileSprite;

				// and to the Pixi Container
				this.mapContainer.addChild(tileSprite);
			}
		}

		return tileSpriteArray;
	}
}

var pixiMapView = new PixiMapViewClass();
export { pixiMapView as PixiMapView };
