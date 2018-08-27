import * as PIXI from 'libs/pixi.min-4-3-5.js';


class UIPixiSpriteHandler {
	// Creates a new PIXI.Sprite from a tileset atlas loaded in by Pixi's resource loader
	static makeSpriteFromAtlas (tileAtlasPath, subtileName) {
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

	static PlayerSprite () {
		return this.makeSpriteFromAtlas(characterAtlasPath, 'player');
	}

	static MapTileSprite (textureReference) {
		// var MapTileSprite = new PIXI.Sprite(PIXI.loader.resources[chestPath].texture);
		// var MapTileSprite = makeSpriteFromAtlas(overworldTilesetPath, 0, 0, 16, 16);
		// var MapTileSprite = makeSpriteFromAtlas(overworldAtlasPath, 'grass-plain');
		return makeSpriteFromAtlas(overworldAtlasPath, textureReference);
	}

	//	Handles a movement
	// 'movement-update', {'username':message['username'],'oldX':oldX, 'oldY':oldY,'pos_x':pos_x,'pos_y':pos_y}
	static handleMovementUpdate (updateJSON) {
	var username = updateJSON['username'];
	var old_x = updateJSON['old_x'];
	var old_y = updateJSON['old_y'];
	var pos_x = updateJSON['pos_x'];
	var pos_y = updateJSON['pos_y'];

	if (isValidMovementUpdateData(updateJSON)) {
		//	If it's the player, follow them with the view
		if (username === clientSession.username) {
			showMapPosition(pos_x,pos_y);
		}

		console.log('A character has moved.. \nUser:' + username + ' to ' + pos_x + ' ' + pos_y);
		// updateCharacterSpritePos(username, old_x, old_y, pos_x, pos_y);
		newCharacterOnMap (username, pos_x, pos_y);
	} else {
		throw new Error('Missing movement update data ' + JSON.stringify(updateJSON));
	}
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

	//	Creates a character sprite on-the-fly to represent another character
	//	gridX, gridY are character positions on the map
	static newCharacterOnMap (charactername, gridX, gridY) {
		console.log('new char.. ' + charactername + gridX + gridY);

		if (!isPositionInOverworld(gridX, gridY)) {
			console.log('bad pos: '+gridX+' '+gridY);
			return false; //	Do nothing if the coordinates don't exist on the map
		} else {
			//	Convert global co-ords to local view ones so we can modify the UI
			var localPos = globalTilePosToLocal(gridX, gridY);
			var localX = localPos[0];
			var localY = localPos[1];

			if (isPositionRelativeToView(localX, localY)) {
				var characterSprite = makeSpriteFromAtlas(characterAtlasPath, 'player');
				var pixiPos = tileCoordToPixiPos(localX,localY);

				console.log('PIXI POS for new char: ' + pixiPos[0] + ' ' + pixiPos[1]);
				characterSprite.x = pixiPos[0];
				characterSprite.y = pixiPos[1];

				mapCharacterArray[localX][localY] = new GridCharacter(charactername, gridX, gridY, characterSprite);

				drawMapCharacterArray ();

				return characterSprite;
			} else {
				console.log('New player not in our view at this position: ' + gridX + ' ' + gridY);
			}

			return false;
		}
	}

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

export { UIPixiSpriteHandler };
