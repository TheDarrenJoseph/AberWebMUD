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
		this.fetchHandler = FetchHandler.getInstance();
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

		//this.socketHandler.bind('character-class-options', (data) => {
		//	pageController.handleCharacterClassOptions(data)
		//});

		this.socketHandler.bind('request-character-details', () => { this.handleRequestCharacterDetails() } );

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

	/**
	 * Given the server has requested character details, we can safely assume we're missing them/have never set them
	 */
	handleRequestCharacterDetails() {
		// Almost guaranteed this is a data validation issue, missing player/character data.
		this.viewController.pageController.handleCharacterDetailsMissing();
	}

	handlePlayerData(data) {
		try {
			Session.ActiveSession.updatePlayer(data);
			let player = Session.ActiveSession.getPlayer();
			console.debug('Updated Player to: ' + JSON.stringify(player))
		} catch(updateError) {
			console.error(updateError);
		}
	}

	retrieveAndUpdatePlayerData(){
		return this.fetchPlayerData().then(jsonData => {
			console.debug('Received player data: ' + JSON.stringify(jsonData))
			this.handlePlayerData(jsonData)
		}).catch(reason => {
			console.debug('Error during Player fetch: ' + JSON.stringify(reason));
		})
	}

	/**
	 *
	 * @param data login response data to immediately save (sessionid, username, etc)
	 * @returns a Promise that is resolved upon successfully retrieving the player's further details from the server
	 */
	handlePlayerLogin (data) {
		// Save this data for our session
		// Session.ActiveSession.setClientSessionData(data);
		let sid = MessageHandler.extractSessionId(data);
		if (sid !== null) {
			console.log('Updating session with response data: ' + JSON.stringify(data));
			// Update user details
			Session.ActiveSession.setClientSessionID(sid);
			let username = data['username'];
			Session.ActiveSession.getPlayer().setUsername(username);

			// If we have a legit username and SID then this session can be assumed to be active
			Session.ActiveSession.setActiveSession(true)
			// No we've got a successful session, grab the player info
			return this.retrieveAndUpdatePlayerData();
		} else {
			throw new RangeError('Session ID not returned upon successful login!');
		}
	}
}

export var GameController = new GameControllerClass();
