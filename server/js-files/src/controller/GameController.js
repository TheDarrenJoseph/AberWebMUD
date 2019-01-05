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

export default class GameController {
	//	Checks that the player's character details are set
	//	and asks them to set them if false
	checkCharacterDetails () {
		if (!SessionController.characterDetailsExist()) {
			PageStatsDialogView.requestCharacterDetails();
		} else {
			this.characterDetailsConfirmed();
		}
	}

	//	data -- 'username':username,'sessionId':sid, 'character':thisPlayer
	handlePlayerLogin (data) {
		//	console.log(data);
		SessionController.updateClientSessionData(data);
		this.checkCharacterDetails(); //	Check/Prompt for character details
	}

	//  Sets up client elements, hooks up callbacks to enable event-driven reponses, then asks the server for a map update
	performSetup () {
		console.log('Starting client..');

		//	Get the general UI ready
		PageController.setupUI();
		PixiController.setupUI();

		this.pixiView = PixiController.pixiView;
		this.mapController = PixiController.mapController;

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
export { GameController };
