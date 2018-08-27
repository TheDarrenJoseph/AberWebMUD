import { socket } from 'libs/socket.io-1.4.5.js';

import { SessionController } from 'src/controller/SessionController.js';

//	A collection of SocketIO management functions
class SocketHandler {
	static isSocketConnected () {
		return socket.connected;
	}

	static sendCharacterDetails (attrValuesJSON, sessionJson) {
		console.log('STATS: ' + attrValuesJSON);
		console.log('SESSION JSON: ' + sessionJson);

		if (attrValuesJSON != null && sessionJson != null) {
			socket.emit('character-details', {'data': attrValuesJSON, 'sessionJson': sessionJson});
		}

		console.log('Character details sent for saving..');
		this.updateStatsInfoLog('Character details submitted (unsaved).', 'client');
	}

	static sendNewChatMessage (userInput, sessionJson) {
		if (userInput !== '') {
			socket.emit('new-chat-message', {'data': userInput, 'sessionJson': sessionJson});
		}
	}

	//	Tries to send movement input for the current user
	static sendMovementCommand (x, y, sessionJson) {
		if (sessionJson.username != null && sessionJson.sessionId != null) {
			console.log({'moveX': x, 'moveY': y, 'sessionJson': sessionJson});
			socket.emit('movement-command', {'moveX': x, 'moveY': y, 'sessionJson': sessionJson});
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

	static connectSocket () {
		console.log('[SocketHandler] Connecting to the game server...');
		socket.io.connect();
		//	socket = io.connect('https://localhost');

		//	return an indication of success/failure.
		return isSocketConnected ();
	}

	static setStatusUpdateCallbacks () {
		//	Link the Session using the sessionId response
		socket.on('connection-response', this.linkConnectionToSession);

		socket.on('movement-response', handleMovementResponse);
		socket.on('movement-update', handleMovementUpdate);
		socket.on('character-details-update', handleCharacterUpdateResponse);

		socket.on('map-data-response', saveMapUpdate);

		socket.on('request-password', requestUserPassword); //  Request for existing password
		socket.on('request-new-password', userDoesNotExist); //  Request for new password
	}

	//	Handlers for socket events
	static handleSessionError () {
		console.log('Session Error!');
	}

	static handleMessageData(data) {
		var messageData = data['chat-data'];
		var username = data['username'];
		console.log("Received: " + data);
		updateMessageLog(messageData, username);
	}

	static setupChat () {
		// Socket custom event trigger for message response, passing in our function for a callback
		socket.on('chat-message-response', this.handleMessageData);
		socket.on('login-success', this.handlePlayerLogin);
		socket.on('login-failure', this.handlePlayerLoginError);
		socket.on('session-error', this.handleSessionError);
	}

	//	Save our given session id for later, and display the welcome message
	static linkConnectionToSession (data) {
		if (this.getSessionIdCookie() == null) {
			this.setClientSessionSessionId(data);
			console.log('Handshaked with server, session ID given:' + Session.clientSession.sessionId);
			setMessageLog(data['messageData']); //Add the welcome message to the message log
		} else {
			console.log('Reconnected, using old SID');
		}
	};
}

export { SocketHandler };
export default SocketHandler;
