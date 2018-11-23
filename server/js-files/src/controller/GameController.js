// Main Controller class for delegating to other controllers
// aka the Controller Controller

// Default imports
import PageStatsDialogView from 'src/view/page/PageStatsDialogView.js';
import SessionController from 'src/controller/SessionController.js';
import PageController from 'src/controller/PageController.js';

// Named imports
import { MapController } from 'src/controller/MapController.js';
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';
import { PixiController } from 'src/controller/pixi/PixiController.js';
import { PageView } from 'src/view/page/PageView.js';
import { Session } from 'src/model/SessionModel.js';

class GameControllerClass {
	constructor () {
		this.mapController = new MapController(PixiController.pixiView.getRenderer());
	}

	//  Sets up client elements, hooks up callbacks to enable event-driven reponses, then asks the server for a map update
	performSetup () {
		console.log('Starting client..');

		//	Get the general UI ready
		PageController.setupPageUI();
		PixiController.setupPixiUI();

		var connected = SocketHandler.connectSocket();
		console.log('Socket: ' + connected);
		if (connected) {
			// setupChat();
			// setStatusUpdateCallbacks();
			// socket.emit('map-data-request');
		}
	}

	//	Checks that the player's character details are set
	//	and asks them to set them if false
	static checkCharacterDetails () {
		if (!SessionController.characterDetailsExist()) {
			PageStatsDialogView.requestCharacterDetails();
		} else {
			PageView.characterDetailsConfirmed();
		}
	}

	//	data -- 'username':username,'sessionId':sid, 'character':thisPlayer
	static handlePlayerLogin (data) {
		//	console.log(data);
		SessionController.updateClientSessionData(data);
		GameController.checkCharacterDetails(); //	Check/Prompt for character details
	}

	//	Continues the login process after a user inputs their character details
	static characterDetailsConfirmed () {
		console.log('CHARDETAILS CONFIRMED, session data: ' + Session.clientSession);
		//	Hide the stats window
		PageView.hideWindow('statWindowId');

		if (!PageView.UI_ENABLED) {
			PixiController.setupUI();
			PageController.enableUI(); //	Enables player interactions
			this.mapController.showMapPosition(Session.clientSession.character.pos_x, Session.clientSession.character.pos_y);

			//	Creates the new character to represent the player
			// PixiMapView.newCharacterOnMap(Session.clientSession.character.charname, Session.clientSession.character.pos_x, Session.clientSession.character.pos_y);
			// mapController.drawMapCharacterArray();

			PageView.UI_ENABLED = true;
		}
	}
}

// Create an instance we can refer to nicely (hide instanciation)
let GameController = new GameControllerClass();
export { GameController };
