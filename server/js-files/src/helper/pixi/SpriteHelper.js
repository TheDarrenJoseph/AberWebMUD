// Helper class for creating PixiJS sprites
import PIXI from 'libs/pixi.min.js';
import AtlasHelper from 'src/helper/pixi/AtlasHelper.js';

export default class SpriteHelper {
	static promisePixiTexture (tileAtlasPath, subtileName, tileHeight, tileWidth) {
		return new Promise((resolve, reject) => {
					AtlasHelper.loadAtlasSubtexture(tileAtlasPath, subtileName, (spriteTexture) => { resolve(spriteTexture); } );
			});
	}

	// Creates a new PIXI.Sprite from a tileset atlas loaded in by Pixi's resource loader
	static makeSpriteFromAtlas (tileAtlasPath, subtileName, tileHeight, tileWidth, pixiPoint, interactive) {
		return new Promise((resolve, reject) => {
			// Wrap the subtexture promise to make a Sprite and return that
			// Otherwise bubble up the error
			//let subtexturePromise = SpriteHelper.promisePixiTexture(tileAtlasPath, subtileName, tileHeight, tileWidth)

			// Load the named subtile from the given atlas
			AtlasHelper.loadAtlasSubtexture(tileAtlasPath, subtileName).then(spriteTexture => {
				if (spriteTexture == undefined || spriteTexture == null) {
					let theError = new RangeError('Invalid Sprite texture! Could not create sprite from atlas with given parameters:\n path: (' +
					tileAtlasPath + ') subtile: (' + subtileName + ') tileSize: [' + tileHeight + ',' + tileWidth + ']');
					reject(theError);
				} else {
					var thisSprite = new PIXI.Sprite(spriteTexture);

					thisSprite.height = tileHeight;
					thisSprite.width = tileWidth;

					if (pixiPoint !== undefined) {
						thisSprite.position = pixiPoint;
					}

					if (interactive !== undefined) {
						thisSprite.interactive = interactive;
					}

					// Not sure if we'll be setting this just here
					// thisSprite.interactive = interactive;

					resolve(thisSprite);
				}
			}).catch(err => {
				reject(err);
			});

		});
	}
}
