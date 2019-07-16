// Main Controller class for delegating to other controllers
// aka the Controller Controller

// Default imports

// Named imports
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';
import { Session } from 'src/model/Session.js';
import { MessageHandler } from 'src/handler/socket/MessageHandler.js';
import { ViewController } from 'src/controller/ViewController.js';

export class GameControllerClass {
	
	constructor() {
		this.socketHandler = SocketHandler.getInstance();
		this.viewController = new ViewController();
	}
	
	onConnected(socket) {
		this.socket = socket;
		this.bindComponents();
		this.socketHandler.emit('map-data-request');
	}
	
	connect() {
		this.socketHandler.connectSocket('http://localhost:5000', (socket) => { this.onConnected(socket) });
	}

	bindComponents () {
		this.viewController.bindComponents();
		this.bindSocketEvents();
	}
	
	newUser(username) {
		// Store the username for later
		Session.ActiveSession.setClientSessionUsername(username);
		this.viewController.pageController.requestUserPassword(true);
	}
	
	handleSessionLinking (data) {
		console.log('Session Link established with server..');

		// Send the data over to the session controller for linking
		Session.ActiveSession.linkConnectionToSession(data);

		//	Session start welcome message
		//	Unpack message data and send it to the message log
		this.viewController.pageController.getPageChatView().setMessageLog(data['messageData']);
	}

	bindSocketEvents () {
		//	Link the Session using the sessionId response
		this.socketHandler.bind('connection-response', (data) => { this.handleSessionLinking(data) } );

		//this.socketHandler.bind('map-data-response', Session.saveMapUpdate);
		this.socketHandler.bind('map-data-response', (mapJson) => {
			let mapModel = this.viewController.pixiController.getMapController().getMap();
			mapModel.updateFromJson(mapJson);
		});

		let pageController = this.viewController.getPageController();
		let pixiController = this.viewController.getPixiController();

		this.socketHandler.bind('movement-response',  (data) => { pageController.handleMovementResponse(data) });
		this.socketHandler.bind('movement-update', pixiController.getMapController().handleMovementUpdate);

		this.socketHandler.bind('character-details-update',  (data) => { pageController.handleCharacterUpdateResponse(data) });
		//  Request for existing password
		this.socketHandler.bind('request-password',  (newUser) => {
			console.log('Password requested.')
			pageController.requestUserPassword(newUser)
		});
		this.socketHandler.bind('request-new-password',  (data) => { pageController.newUser(data) });

		this.socketHandler.bind('chat-message-response', (data) => {  this.handleMessageData(data); });
		this.socketHandler.bind('login-success', (data) => { this.handlePlayerLogin(data); });
		this.socketHandler.bind('login-failure', (data) => { pageController.handlePlayerLoginError(data); } );
		this.socketHandler.bind('session-error', () => { this.socketHandler.handleSessionError(); } );
	}
	
	handleMessageData (data) {
		var messageData = data['chat-data'];
		var username = data['username'];
		console.log('Received message: ' + data);

		this.viewController.pageController.getPageChatView().updateMessageLog(messageData, username);
	}

	//	data -- 'username':username,'sessionId':sid, 'character':thisPlayer
	handlePlayerLogin (data) {
		// Save this data for our session
		Session.ActiveSession.updateClientSessionData(data);
	}

}

export var GameController = new GameControllerClass();
