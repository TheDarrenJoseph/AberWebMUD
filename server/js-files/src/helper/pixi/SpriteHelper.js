// Helper class for creating PixiJS sprites
import * as PIXI from 'libs/pixi.min.js';
import AtlasHelper from 'src/helper/pixi/AtlasHelper.js';

export default class SpriteHelper {
	// Creates a new PIXI.Sprite from a tileset atlas loaded in by Pixi's resource loader
	static makeSpriteFromAtlas (tileAtlasPath, subtileName, tileSize) {
		// Load the named subtile from the given atlas
		var spriteTexture = AtlasHelper.getAtlasSubtexture(tileAtlasPath, subtileName);

		//	Check the texture
		if (spriteTexture != null) {
			let thisSprite = new PIXI.Sprite(spriteTexture);
			thisSprite.height = tileSize;
			thisSprite.width = tileSize;
			return thisSprite;
		} else {
			console.log('Could not create sprite from atlas with given parameters: ' + tileAtlasPath + ':' + subtileName + ':' + tileSize);
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
	// 	if (isPositionInMap(old_x_global, old_y_global) && isPositionInMap(new_x_global, new_y_global)) {
	// 		//Have they only moved within the screen?
	// 		if (isGlobalPositionInMapView(old_x_global, old_y_global)) {
	// 			//Moves the sprite to the new position
	// 			if (isGlobalPositionInMapView(new_x_global, new_y_global)) {
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
	// 		} else if (isGlobalPositionInMapView(new_x_global, new_y_global)) { //Moved into screen from
	// 			newCharacterOnMap (charname, new_x_global, new_y_global); //Create a sprite to show them!
	// 			console.log(charname+' has walked into view!');
	// 		}
	// 	}
	// }
}
