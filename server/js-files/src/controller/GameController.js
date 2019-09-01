// Main Controller class for delegating to other controllers
// aka the Controller Controller

// Default imports

// Named imports
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';
import { Session } from 'src/model/Session.js';
import { MessageHandler } from 'src/handler/socket/MessageHandler.js';
import { ViewController } from 'src/controller/ViewController.js';
import { FetchHandler } from 'src/handler/http/FetchHandler.js';

const SERVER_URL = 'http://localhost:5000';

// Login response validation
export const EXPECTED_LOGIN_SUCCESS_PARAMS = ['sessionId'];
export const ERROR_LOGIN_RS_MISSING_USERNAME = new RangeError('Username missing on login response!')
export const ERROR_LOGIN_RS_MISSING_CHARDETAILS = new RangeError('Character details missing on login response!')

export class GameControllerClass {
	
	constructor(doc) {
		this.socketHandler = SocketHandler.getInstance();
		this.viewController = new ViewController(doc);

		let docUrlParts = document.URL.split('/');
		let protocol = docUrlParts[0]+'//'
		let baseUrl = docUrlParts[2];
		console.info('PageController FetchHandler URL: ' + protocol + baseUrl)
		this.fetchHandler = new FetchHandler(protocol + baseUrl);
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
		return new Promise ( (resolve, reject ) => {
			let connPromise = this.socketHandler.connectSocket(SERVER_URL);
			connPromise.then(socket => {
				this.onConnected(socket);
				resolve();
			}).catch(reject);
		});
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

		this.socketHandler.bind('attribute-class-options', (data) => {
			pageController.handleCharacterClassOptions(data)
		});

		//  Request for existing password
		this.socketHandler.bind('request-password',  (username) => {
			pageController.requestUserPassword(username, 'Please enter your password: ');
		});
		this.socketHandler.bind('request-new-password',  (username) => {
			pageController.requestUserPassword(username, 'Creating a new user, please enter a password for it: ');
		});

		this.socketHandler.bind('chat-message-response', (data) => {  this.handleMessageData(data); });
		this.socketHandler.bind('login-success', (data) => {
			this.handlePlayerLogin(data);
		});
		this.socketHandler.bind('login-failure', (data) => { pageController.handlePlayerLoginError(data); } );
		this.socketHandler.bind('session-error', () => { this.socketHandler.handleSessionError(); } );
	}
	
	handleMessageData (data) {
		var messageData = data['chat-data'];
		var username = data['username'];
		console.log('Received message: ' + data);

		this.viewController.pageController.getPageChatView().updateMessageLog(messageData, username);
	}

	fetchPlayerData() {
		return this.fetchHandler.get('/player');
	}

	handlePlayerData(data) {
		try {
			Session.ActiveSession.updatePlayer(data);
		} catch(updateError) {
			// Almost guaranteed this is a data validation issue, missing player/character data.
			this.viewController.pageController.handleCharacterDetailsMissing();
		}
	}

	retrieveAndUpdatePlayerData(){
		this.fetchPlayerData().then(jsonData => {
			this.handlePlayerData(jsonData)
		}).catch(reason => { throw reason })
	}

	handlePlayerLogin (data) {
		// Save this data for our session
		// Session.ActiveSession.setClientSessionData(data);
		let sid = MessageHandler.extractSessionId(data);
		if (sid !== null) {
			console.log('Updating session with response data: ' + JSON.stringify(data));
			// Update user details
			Session.ActiveSession.setClientSessionID(sid)
			// If we have a legit SID then this session can be assumed to be active
			Session.ActiveSession.setActiveSession(true)
			// No we've got a successful session, grab the player info
			this.retrieveAndUpdatePlayerData();
		} else {
			throw new RangeError('Session ID not returned upon successful login!');
		}
	}
}

export var GameController = new GameControllerClass();
