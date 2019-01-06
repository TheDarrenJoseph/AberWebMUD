
//	Other Handlers
import { PixiController } from 'src/controller/pixi/PixiController.js';

//	There's going to be a look of controller hookups here for now..
import SessionController from 'src/controller/SessionController.js';
import PageController from 'src/controller/page/PageController.js';

//	Views
import PageChatView from 'src/view/page/PageChatView.js';
import PageStatsDialogView from 'src/view/page/PageStatsDialogView.js';
import { PageView } from 'src/view/page/PageView.js';

import { MessageHandler } from 'src/handler/socket/MessageHandler.js';
//import * as io from 'libs/socket.io.js';
import io from 'socket.io-client';

//import io from 'socket.io-client';

var socket = io();

//	Static Helper class
//	A collection of SocketIO management functions
class SocketHandler {
	static isSocketConnected () {
		return socket.connected;
	}

	static sendCharacterDetails (attrValuesJSON) {
		console.log('STATS: ' + attrValuesJSON);

		if (attrValuesJSON != null) {
			socket.emit('character-details', MessageHandler.createDataMessage(attrValuesJSON));
		}

		console.log('Character details sent for saving..');
		PageStatsDialogView.updateStatsInfoLog('Character details submitted (unsaved).', 'client');
	}

	static sendNewChatMessage (userInput) {
		if (userInput !== '') {
			socket.emit('new-chat-message', MessageHandler.createDataMessage(userInput));
		}
	}

	//	Tries to send movement input for the current user
	static sendMovementCommand (x, y) {
		var messagePayload = MessageHandler.createMovementMessage(x, y);
		if (messagePayload[MessageHandler.SESSION_JSON_NAME] != null) {
			console.log(messagePayload);
			socket.emit('movement-command', messagePayload);
		} else {
			console.log('Session info missing for movement command.');
		}
	}

	//	Send the user's password to the sever
	static sendAuthentication (username, passwordFieldVal) {
		socket.emit('client-auth', {'username': username, 'password': passwordFieldVal});
	}

	static saveMapUpdate (mapData) {
		//	Hand the data straight over to the relevant controller
		SessionController.saveMapUpdate(mapData);
		console.log('MAP DATA RECEIVED');
	}

	static connectSocket (url, callback) {
		console.log('[SocketHandler] Connecting to the game server...');

		//	Try to connect
		socket = io.connect(url);
		// Call us back when we really connect
		socket.on('connect', callback);
	}

	static unpackMessageData (data) {
		return data['messageData'];
	}

	static handleSessionLinking (data) {
		// Send the data over to the session controller for linking
		SessionController.linkConnectionToSession(data);

		//	Session start welcome message
		//	Unpack message data and send it to the message log
		PageChatView.setMessageLog(SocketHandler.unpackMessageData(data));
	}

	static setStatusUpdateCallbacks () {
		//	Link the Session using the sessionId response
		socket.on('connection-response', this.handleSessionLinking);
		socket.on('map-data-response', this.saveMapUpdate);

		socket.on('movement-response', PageController.handleMovementResponse);
		socket.on('movement-update', PixiController.handleMovementUpdate);

		socket.on('character-details-update', PageController.handleCharacterUpdateResponse);
		socket.on('request-password', PageView.requestUserPassword); //  Request for existing password
		socket.on('request-new-password', PageView.newUserPassword); //  Request for new password
	}

	//	Handlers for socket events
	static handleSessionError () {
		console.log('Session Error!');
	}

	static handleMessageData (data) {
		var messageData = data['chat-data'];
		var username = data['username'];
		console.log('Received: ' + data);
		PageChatView.updateMessageLog(messageData, username);
	}

	static setupChat () {
		// Socket custom event trigger for message response, passing in our function for a callback
		socket.on('chat-message-response', this.handleMessageData);
		socket.on('login-success', this.handlePlayerLogin);
		socket.on('login-failure', this.handlePlayerLoginError);
		socket.on('session-error', this.handleSessionError);
	}
	
	static emit(eventName) {
		socket.emit(eventName);
	}
}

export { SocketHandler };
export default SocketHandler;
