// Main Controller class for delegating to other controllers
// aka the Controller Controller

// Default imports

// Named imports
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';
import { Session } from 'src/model/Session.js';
import { MessageHandler } from 'src/handler/socket/MessageHandler.js';
import { ViewController } from 'src/controller/ViewController.js';
import { ERROR_LOGIN_RS_MISSING_CHARDETAILS } from '../model/Session.js'

const SERVER_URL = 'http://localhost:5000';

export class GameControllerClass {
	
	constructor(doc) {
		this.socketHandler = SocketHandler.getInstance();
		this.viewController = new ViewController(doc);
	}

	getSocketHandler() {
		return this.socketHandler;
	}

	getViewController() {
		return this.viewController;
	}

	onConnected(socket) {
		this.socket = socket;
		this.bindComponents();
		this.socketHandler.emit('map-data-request');
	}
	
	connect() {
		this.socketHandler.connectSocket(SERVER_URL, (socket) => { this.onConnected(socket) });
	}

	reConnect() {
		this.socketHandler.reconnectSocket(SERVER_URL, (socket) => { this.onConnected(socket) });
	}

	bindComponents () {
		this.viewController.bindComponents();
		this.bindSocketEvents();
	}

	linkSession(data) {
		// Send the data over to the session controller for linking
		let currentSid = Session.ActiveSession.linkConnectionToSession(data);
		this.socketHandler.validateSessionId(currentSid);
	}

	handleConnectionResponse (data) {
		console.log('Session Link established with server..');
		this.linkSession(data);

		//	Session start welcome message
		//	Unpack message data and send it to the message log
		this.viewController.pageController.getPageChatView().setMessageLog(data['messageData']);
	}

	handleInvalidSid(sessionId) {
		console.log('Session ID no longer valid: ' + sessionId);
		Session.ActiveSession.deleteSessionIdCookie();
		this.reConnect();
	}

	bindSocketEvents () {
		//	Link the Session using the sessionId response
		this.socketHandler.bind('connection-response', (data) => { this.handleConnectionResponse(data) } );

		this.socketHandler.bind('invalid-sid', sidString => this.handleInvalidSid(sidString));

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
		this.socketHandler.bind('request-password',  (username) => {
			pageController.requestUserPassword(username, 'Please enter your password: ');
		});
		this.socketHandler.bind('request-new-password',  (username) => {
			pageController.requestUserPassword(username, 'Creating a new user, please enter a password for it: ');
		});

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

	//	data -- {"sessionId":"66063e8275f945769481ba21674be1cf",
	//	"player-status":{"username":"foo",
	//	"char-details" : {
	//		"charname" : "foo"
	//		"pos_x
	//	}
	//	}}
	handlePlayerLogin (data) {
		try {
			// Save this data for our session
			Session.ActiveSession.setClientSessionData(data);
			if (!data.hasOwnProperty('character')) {
				this.viewController.pageController.getPageChatView().updateMessageLog('Player Character details not present, please enter them..', 'client');
				this.viewController.pageController.getPageCharacterDetailsView().requestCharacterDetails();
			}
		} catch (err) {
			let errMsg = 'Unexpected error when handling login response data.';
			this.viewController.pageController.getPageChatView().updateMessageLog(errMsg, 'client');
			console.log(errMsg + ' : ' + err);
		}
	}

}

export var GameController = new GameControllerClass();
