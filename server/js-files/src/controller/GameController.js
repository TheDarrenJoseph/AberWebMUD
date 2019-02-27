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
		this.pageController = new PageController(this.characterDetailsConfirmed);
		// Extract the view for now
		this.pageView = this.pageController.pageView;
		this.socketHandler = new SocketHandler();

		//	Get the general UI ready
		//this.pageController.setupUI();
		//this.pixiController.setupUI();
	}
	
	onConnected(){
		console.log('SocketIO connected to game server!');
		console.log(this.pageController);
		
		this.bindChat();
		this.bindStatsUpdates();
		this.socketHandler.emit('map-data-request');
	}
	
	connect() {
		this.socketHandler.connectSocket('http://localhost:5000', () => { this.onConnected() });
	}
	
	
	// Setup and enable UI elements
	// This should be idempotent
	enableUI () {
		if (PixiController.isUIEnabled()) {
			PixiController.enableUI();
		}
		
		if (!this.pageController.isUIEnabled()) {
			this.pageController.enableUI();
		}
	}
	
	//	Continues the login process after a user inputs their character details
	characterDetailsConfirmed () {
		console.log('CHARDETAILS CONFIRMED, session data: ' + Session.clientSession);
		//	Hide the stats window
		this.pageView.hideWindow('statWindowId');
		this.enableUI();
		PixiController.getMapController().showMapPosition(Session.clientSession.character.pos_x, Session.clientSession.character.pos_y);

		//	Creates the new character to represent the player
		// PixiMapView.newCharacterOnMap(Session.clientSession.character.charname, Session.clientSession.character.pos_x, Session.clientSession.character.pos_y);
		// mapController.drawMapCharacterArray();
	}
	
	newUser(username) {
		// Store the username for later
		SessionController.setClientSessionUsername(username);
		this.pageController.requestUserPassword(true);
	}
	
	handleSessionLinking (data) {
		// Send the data over to the session controller for linking
		SessionController.linkConnectionToSession(data);

		//	Session start welcome message
		//	Unpack message data and send it to the message log
		this.pageController.pageChatView.setMessageLog(data['messageData']);
	}

	bindStatsUpdates () {
		//	Link the Session using the sessionId response
		this.socketHandler.bind('connection-response', (data) => { this.handleSessionLinking(data) } );
		this.socketHandler.bind('map-data-response', SessionController.saveMapUpdate);

		this.socketHandler.bind('movement-response',  (data) => { this.pageController.handleMovementResponse(data) });
		this.socketHandler.bind('movement-update', PixiController.handleMovementUpdate);

		this.socketHandler.bind('character-details-update',  (data) => { this.pageController.handleCharacterUpdateResponse(data) });
		this.socketHandler.bind('request-password',  (newUser) => { this.pageController.requestUserPassword(newUser) }); //  Request for existing password
		this.socketHandler.bind('request-new-password',  (data) => { this.pageController.newUser(data) }); //  Request for new password
	}
	
	handleMessageData (data) {
		var messageData = data['chat-data'];
		var username = data['username'];
		console.log('Received: ' + data);
		this.pageController.pageChatView.updateMessageLog(messageData, username);
	}
	
	bindChat () {
		// Socket custom event trigger for message response, passing in our function for a callback
		this.socketHandler.bind('chat-message-response', this.handleMessageData);
		this.socketHandler.bind('login-success', this.handlePlayerLogin);
		this.socketHandler.bind('login-failure', this.pageController.handlePlayerLoginError);
		this.socketHandler.bind('session-error', this.handleSessionError);
	}

}

export var GameController = new GameControllerClass();
