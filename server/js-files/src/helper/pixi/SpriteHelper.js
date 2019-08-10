// Helper class for creating PixiJS sprites
import PIXI from 'libs/pixi.min.js';
import AtlasHelper from 'src/helper/pixi/AtlasHelper.js';

export default class SpriteHelper {

	static handleAtlasSubtexture(spriteTexture, tileAtlasPath, subtileName, tileHeight, tileWidth, pixiPoint, interactive) {
		// Load the named subtile from the given atlas
			if (spriteTexture == undefined || spriteTexture == null) {
				let theError = new RangeError('Invalid Sprite texture! Could not create sprite from atlas with given parameters:\n path: (' +
				tileAtlasPath + ') subtile: (' + subtileName + ') tileSize: [' + tileHeight + ',' + tileWidth + ']');
				throw new RangeError(theError);
			} else {
				var thisSprite = new PIXI.Sprite(spriteTexture);

				thisSprite.height = tileHeight;
				thisSprite.width = tileWidth;

				if (pixiPoint !== undefined && pixiPoint instanceof PIXI.Point) {
					//console.debug('Using Pixi Point: ' + pixiPoint.x + ',' + pixiPoint.y)
					thisSprite.position = pixiPoint;
				} else {
					throw new RangeError('Sprite PIXI.Point is undefined!')
				}

				if (interactive !== undefined) {
					thisSprite.interactive = interactive;
				}
				return thisSprite;
			}
	}

	// Creates a new PIXI.Sprite from a tileset atlas loaded in by Pixi's resource loader
	static makeSpriteFromAtlas (tileAtlasPath, subtileName, tileHeight, tileWidth, pixiPoint, interactive) {
		return new Promise((resolve, reject) => {
			AtlasHelper.loadAtlasSubtexture(tileAtlasPath, subtileName).then(spriteTexture => {
				let theSprite = SpriteHelper.handleAtlasSubtexture(spriteTexture, tileAtlasPath, subtileName, tileHeight, tileWidth, pixiPoint, interactive);
				resolve(theSprite);
			}).catch(err => {
				reject(err);
			});

		});
	}
}
