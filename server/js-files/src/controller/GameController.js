// Main Controller class for delegating to other controllers
// aka the Controller Controller

// Default imports
import PageStatsDialogView from 'src/view/page/PageStatsDialogView.js';
import SessionController from 'src/controller/SessionController.js';
import PageController from 'src/controller/page/PageController.js';

// Named imports
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';
import { PixiController } from 'src/controller/pixi/PixiController.js';
import { PageView } from 'src/view/page/PageView.js';
import { Session } from 'src/model/Session.js';

class GameControllerClass {
	
	constructor() {
		console.log('Starting client..');
		
		this.pageController = new PageController(this.characterDetailsConfirmed);
	
		//	Get the general UI ready
		this.pageController.setupUI();
		PixiController.setupUI();
	}
	
	connect() {
			SocketHandler.connectSocket('http://localhost:5000', () => {
				console.log('SocketIO connected to game server!');
				SocketHandler.setupChat();
				SocketHandler.setStatusUpdateCallbacks();
				SocketHandler.emit('map-data-request');
			});
	}

	//	Continues the login process after a user inputs their character details
	characterDetailsConfirmed () {
		console.log('CHARDETAILS CONFIRMED, session data: ' + Session.clientSession);
		//	Hide the stats window
		PageView.hideWindow('statWindowId');

		if (!PageView.UI_ENABLED) {
			PixiController.setupUI();
			// Turn on UI components
			PageController.enableUI();
			PixiController.enableUI();
		
			PixiController.getMapController().showMapPosition(Session.clientSession.character.pos_x, Session.clientSession.character.pos_y);

			//	Creates the new character to represent the player
			// PixiMapView.newCharacterOnMap(Session.clientSession.character.charname, Session.clientSession.character.pos_x, Session.clientSession.character.pos_y);
			// mapController.drawMapCharacterArray();
		}
	}
	
	newUser(username) {
		// Store the username for later
		SessionController.setClientSessionUsername(username);
		PageController.requestUserPassword(true);
	}

}

export var GameController = new GameControllerClass();
