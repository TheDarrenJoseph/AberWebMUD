import $ from 'libs/jquery-3.1.1.js';

var htmlWindows = {messageWindowId: '#message-window', statWindowId: '#stat-window', inventoryWindowId: '#inventory-window'};

var UI_ENABLED = false;

//	General UI Page View
class UIPageView {
	//	tileSpriteArray -- the grid array of sprites available to the UI
	//	mapData -- the JSON response from the server describing the area
	//	startX/Y - the start areas to draw from
	static drawMapToGrid (startX, startY) {
		mapContainer.removeChildren(); //Clear the map display container first

		//	Check there's at least enough tiles to fill our grid (square map)
		if (overworldMap.length >= tileCount) {
			var endX = startX + tileCount;
			var endY = startY + tileCount;

			console.log('MAP DRAWING| to grid from: '+startX + ' ' + startY + ' to ' + endX + ' ' + endY);

			//	Local looping to iterate over the view tiles
			//	Oh gosh condense this please!
			for (var x = 0; x < tileCount; x++) {
				for (var y = 0; y < tileCount; y++) {
					//	Accessing one of the window tiles
					var tileSprite = tileSpriteArray[x][y];

					try {
						var globalXY = localTilePosToGlobal(x, y);
						var globalX = globalXY[0];
						var globalY = globalXY[1];

						if (isPositionInOverworld(globalX, globalY)) {
							var tileFromServer = overworldMap[globalX][globalY];

								if (tileSprite != null && tileFromServer != null) { //	Check the data for this tile exists
									//	var thisSprite = mapContainer.getChildAt(0); //	Our maptile sprite should be the base child of this tile
									var subTexture = getAtlasSubtexture(overworldAtlasPath, tileMappings[tileFromServer.tileType]);

									//If the texture exists, set this sprite's texture,
									// and add it back to the container
									if (subTexture != null) {
										tileSprite.texture = subTexture;
										mapContainer.addChild(tileSprite);
									}
								}
						}
					} catch (err) {
						continue;
					}
				}
			}
		} else {
			console.log('MAP DRAWING| overworld map data from remote is missing.');
		}
	}

	static showWindow (dialog) {
		$(htmlWindows[dialog]).show();
	}

	static hideWindow (dialog) {
		$(htmlWindows[dialog]).hide();
	}

	static hideWindows () {
		for (windowId in htmlWindows) {
			this.hideWindow(windowId);
		}
	}

	static toggleWindow (dialog) {
		var dialog = $(htmlWindows[dialog]);
		var toHide = dialog.is(':visible'); //Check if the dialog is visible to begin with

		$('.dialog:visible').hide();

		if (toHide) {
			dialog.hide();
		} else {
			dialog.show();
		}
	}

	static toggleStatWinVisibility () {
		toggleWindow('statWindowId');
	}

	static toggleIventoryWinVisibility () {
		toggleWindow('inventoryWindowId');
	}

	static toggleConsoleVisibility () {
		toggleWindow('messageWindowId');
	}

	static showDialog () {
		dialogBackground.visible = !dialogBackground.visible;
		renderer.render(stage); //	update the view to show this
	}

	//	Triggered once a user sends a login message, asks for user password
	//	username is a username string
	static requestUserPassword (username) {
		$('#password-input').show();

		if (username !== undefined) {
			clientSession.username = username; //	Set the current session username
			setMessageLog('Please enter the password for user ' + username);
		} else {
			setMessageLog('Account created, please enter your password');
		}

		bindMessageButton(false); //	Set the send message behaviour to password sending
	}

	static userDoesNotExist (username) {
		var new_user = confirm('User does not exist, do you want to create it?');
		if (new_user) requestUserPassword (username);
	}

	static showControls (show) {
		controlsContainer.visisble = show;
		renderer.render(controlsContainer);
	}

	static sendPassword () {
		var passwordField = $('#password-input');
		var username = clientSession.username;
		var passwordInput = passwordField.val();

		if (username != null && passwordInput != '') {
			sendAuthentication(username, passwordInput);
			passwordField.val(''); //Blank the field now we're done getting input
			passwordField.hide(); //Hide the field to show the normal input box
			$('#message-log').val('');
			bindMessageButton(true); //Set the send button behavior back to normal
		} else {
			updateMessageLog('Invalid password.', 'client');
		}
	}

	static requestCharacterDetails() {
		showStatWindow();
		updateStatsInfoLog('You need to set your character details.', 'client');
	}

	//Checks that the player's character details are set, and asks them to set them if false
	static checkCharacterDetails() {
		if (!characterDetailsExist ()) {
			requestCharacterDetails();
		} else {
			characterDetailsConfirmed();
		}
	}

	static saveCharacterUpdate (characterData) {
		setStatsFromJsonResponse(characterData); //Update local stats window from the message
		updateClientSessionData(characterData);
		updateStatsInfoLog('Character details saved.', 'server');
	}

	static handleCharacterUpdateResponse (messageJson) {
		if (messageJson['success'] != null) {
			console.log('DETAILS EXIST?: ' + characterDetailsExist());
			console.log('UPDATING LOCAL CHARDETAILS using: '+messageJson);

		if (messageJson['success'] == true) {
			//If this is our first update, trigger the UI startup
			if (!characterDetailsExist()) {
		  	saveCharacterUpdate(messageJson['char-data']); //Save the data ready for the UI
		  	characterDetailsConfirmed(); //Trigger confirmation (uses these stats)
			} else {
		  	saveCharacterUpdate(messageJson['char-data']);
			}
		} else {
			updateStatsInfoLog('Invalid character details/update failure', 'server');
		}
		}
	}

	//Continues the login process after a user inputs their character details
	static characterDetailsConfirmed() {
	console.log('CHARDETAILS CONFIRMED, session data: '+clientSession);
	hideWindow('statWindowId'); //Hide the stats windows

	if (!UI_ENABLED) {
	setupUI();
	enableUI(); //Enables player interactions
	showMapPosition(clientSession.character.pos_x, clientSession.character.pos_y);
	//Creates the new character to represent the player
	newCharacterOnMap (clientSession.character.charname , clientSession.character.pos_x, clientSession.character.pos_y);

	UI_ENABLED = true;
	}
	}

	//	data -- 'username':username,'sessionId':sid, 'character':thisPlayer
	static handlePlayerLogin(data){
	//	console.log(data);
	updateClientSessionData(data);
	checkCharacterDetails(); //Check/Prompt for character details
	}

	static handlePlayerLoginError (data) {
	console.log(data);
	if (data['playerExists']) {
	updateMessageLog('Login failure (bad password)', 'server');
	} else {
	updateMessageLog('Login failure (player does not exist)', 'server');
	}
	}
}

export { UIPageView };
