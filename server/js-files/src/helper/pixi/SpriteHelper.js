import * as PIXI from 'libs/pixi.min-4-3-5.js';

class SpriteHelper {
	// Creates a new PIXI.Sprite from a tileset atlas loaded in by Pixi's resource loader
	static makeSpriteFromAtlas (tileAtlasPath, subtileName, tileSize) {
		var atlasTexture = PIXI.loader.resources[tileAtlasPath];

		//	Check the texture
		if (atlasTexture != null) {
			var subTexture = atlasTexture.textures[subtileName];

			if (subTexture != null) {
				var thisSprite = new PIXI.Sprite(subTexture);
				thisSprite.height = tileSize;
				thisSprite.width = tileSize;
				return thisSprite;
			} else {
				console.log('No tile atlas subtile (not in tile atlas JSON?): ' + subtileName);
			}
		} else {
			console.log('Error loading tile atlas (not known to loader?): ' + tileAtlasPath);
		}

		return null;
	}

	static PlayerSprite (characterAtlasPath) {
		return SpriteHelper.makeSpriteFromAtlas(characterAtlasPath, 'player');
	}

	// function deleteMapCharacter(global_x, global_y) {
	//  //Converting global pos to local relative to view
	//  var localOldPos = globalTilePosToLocal(global_x, global_y);
	//  var old_sprite = mapCharacterArray[localOldPos[0]][localOldPos[1]];

	//  if (old_sprite != null) {
	//    characterContainer.removeChild(old_sprite); //Ask pixiJS to remove this sprite from our container
	//    renderer.render(stage);
	//  } else {
	//    throw new Error('Expected sprite to remove, null found! at: ' + localOldPos[0] + ' ' + localOldPos[1]);
	//  }
	// }

	// function updateCharacterSpritePos(charname, old_x_global, old_y_global, new_x_global, new_y_global) {
	// 	console.log('OLDX: '+old_x_global);
	// 	console.log('OLDY: '+old_y_global);
	// 	console.log('X: '+new_x_global);
	// 	console.log('Y: '+new_y_global);
	//
	// 	if (isPositionInOverworld(old_x_global, old_y_global) && isPositionInOverworld(new_x_global, new_y_global)) {
	// 		//Have they only moved within the screen?
	// 		if (isPositionInMapView(old_x_global, old_y_global)) {
	// 			//Moves the sprite to the new position
	// 			if (isPositionInMapView(new_x_global, new_y_global)) {
	// 				//var localNewPos = globalTilePosToLocal(new_x_global, new_y_global);
	// 				console.log('Moving '+charname+'!');
	//
	// 				newCharacterOnMap (charname, new_x_global, new_y_global);
	//
	// 			} else {
	// 				console.log(charname+' walked out of view!'); //Moved out of screen
	// 			}
	//
	//       deleteMapCharacter(old_x_global,old_y_global); //Delete the old sprite
	//
	// 		} else if (isPositionInMapView(new_x_global, new_y_global)) { //Moved into screen from
	// 			newCharacterOnMap (charname, new_x_global, new_y_global); //Create a sprite to show them!
	// 			console.log(charname+' has walked into view!');
	// 		}
	// 	}
	// }
}

export { SpriteHelper };
