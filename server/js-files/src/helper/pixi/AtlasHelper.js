// Helper class for working with texture PixiJS atlasses / spritesheets
import * as PIXI from 'libs/pixi.min.js';

export default class AtlasHelper {
	static getAtlasSubtexture (tileAtlasPath, subtileName) {
		var atlasTexture = PIXI.loader.resources[tileAtlasPath];

		//	Check the texture
		if (atlasTexture != null) {
			var subTexture = atlasTexture.textures[subtileName];

			if (subTexture != null) {
				return subTexture;
			} else {
				console.log('No tile atlas subtile (not in tile atlas JSON?): ' + subtileName);
			}
		} else {
			console.log('Error loading tile atlas (not known to loader?): ' + tileAtlasPath);
		}

		return null;
	}
}
