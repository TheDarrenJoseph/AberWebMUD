// Main Controller class for delegating to other controllers
// aka the Controller Controller

// Default imports
import PageCharacterDetailsView from 'src/view/page/PageCharacterDetailsView.js';
import PageController from 'src/controller/page/PageController.js';

// Named imports
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';
import { PixiController } from 'src/controller/pixi/PixiController.js';
import { PageView } from 'src/view/page/PageView.js';
import { Session } from 'src/model/Session.js';

export class GameControllerClass {
	
	constructor() {		
		this.pageController = new PageController();
		this.pixiController = new PixiController(PageView.getWindowDimensions(), this.pageController);
		
		// Extract the view for now
		this.pageView = this.pageController.pageView;
		this.socketHandler = new SocketHandler();

		//	Get the general UI ready
		//this.pageController.setupUI();
		//this.pixiController.setupUI();
	}
	
	onConnected() {
		console.log('SocketIO connected to game server!');
		console.log(this.pageController);

		this.bindComponents();

		this.socketHandler.emit('map-data-request');
	}
	
	connect() {
		this.socketHandler.connectSocket('http://localhost:5000', () => { this.onConnected() });
	}

	// Setup and enable UI elements
	enableUI () {
			this.pixiController.enableUI();
			this.pageController.enableUI();
	}

	bindComponents () {
		this.pageController.pageView.bindStageClick(this.pixiController.stageClicked);

		// EventMappings
		// Once the character details are set, confirm that we have some
		this.pageController.characterDetails.on(characterDetailsEvents.SET_STATS, this.characterDetailsConfirmed);

		this.bindChat();
		this.bindStatsUpdates();
	}

	/**
	 * Continues the login process once we've set/retrieved character details
	 */
	characterDetailsConfirmed () {
		console.log('CHARDETAILS CONFIRMED, session data: ' + Session.ActiveSession.clientSession);
		//	Hide the stats window
		this.pageView.hideWindow('statWindowId');
		this.enableUI();
		this.pixiController.getMapController().showMapPosition(
		Session.ActiveSession.clientSession.characterDetails.pos_x,
		Session.ActiveSession.clientSession.characterDetails.pos_y);

		//	Creates the new character to represent the player
		// TODO Add a player and draw them
	}
	
	newUser(username) {
		// Store the username for later
		Session.ActiveSession.setClientSessionUsername(username);
		this.pageController.requestUserPassword(true);
	}
	
	handleSessionLinking (data) {
		// Send the data over to the session controller for linking
		Session.ActiveSession.linkConnectionToSession(data);

		//	Session start welcome message
		//	Unpack message data and send it to the message log
		this.pageController.pageChatView.setMessageLog(data['messageData']);
	}

	bindStatsUpdates () {
		//	Link the Session using the sessionId response
		this.socketHandler.bind('connection-response', (data) => { this.handleSessionLinking(data) } );


		//this.socketHandler.bind('map-data-response', Session.saveMapUpdate);
		this.socketHandler.bind('map-data-response', (data) => {
			let mapModel = this.pixiController.getMapController().getMap()
			MessageHandler.updateMapFromResponse(mapModel, mapJson);
		});


		this.socketHandler.bind('movement-response',  (data) => { this.pageController.handleMovementResponse(data) });
		this.socketHandler.bind('movement-update', this.pixiController.handleMovementUpdate);

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

	//	data -- 'username':username,'sessionId':sid, 'character':thisPlayer
	handlePlayerLogin (data) {
		// Save this data for our session
		Session.ActiveSession.updateClientSessionData(data);
		this.pageController.onceCharacterDetailsSet(this.characterDetailsConfirmed);
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
