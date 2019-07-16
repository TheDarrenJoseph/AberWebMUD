//import { as io} from 'libs/io.io.js';

import io from 'socket.io-client';
import { MessageHandler } from 'src/handler/socket/MessageHandler.js';

const CONNECTION_EVENT = 'connect';
const DISCONNECTION_EVENT = 'disconnect';
const RECONNECTION_EVENT = 'reconnect'

//	Static Helper class
//	A collection of SocketIO management functions
export default class SocketHandler {

	constructor () {
		this.io = new io();
	}
	
	isSocketConnected () {
		return this.io.connected;
	}
	
	emit(eventType, messageData) {
		// We can send an event without data in some cases
		if (messageData == undefined) {
			this.io.emit(eventType);
		} else if (messageData !== undefined  && messageData !== '' && messageData !== null) {
			this.io.emit(eventType, MessageHandler.createDataMessage(messageData));
		}

		console.log(' Emitted: ' + eventType);
	}
	
	bind(event, callback) {
		this.io.on(event,callback);
	}

	sendCharacterDetails (attrValuesJSON) {
		this.emit('character-details', attrValuesJSON);
	}

	sendNewChatMessage (userInput) {
		this.emit('new-chat-message', userInput);
	}

	//	Tries to send movement input for the current user
	sendMovementCommand (x, y) {
		var messagePayload = MessageHandler.createMovementMessage(x, y);
		if (messagePayload[MessageHandler.SESSION_JSON_NAME] != null) {
			console.log(messagePayload);
			this.io.emit('movement-command', messagePayload);
		} else {
			console.log('Session info missing for movement command.');
		}
	}

	//	Send the user's password to the sever
	sendAuthentication (username, passwordFieldVal) {
		this.io.emit('client-auth', {'username': username, 'password': passwordFieldVal});
	}

	connectSocket (url, callback) {
		console.log('[SocketHandler] Connecting to the game server...');

		//	Try to connect, this must be first
		this.io = io.connect(url);

		// Call us back when we really connect
		this.io.on(CONNECTION_EVENT, () => {
			console.log('SocketIO Socket connected.');
			callback(this.io);
		});

	}

	//	Handlers for io events
	handleSessionError () {
		console.log('Session Error!');
	}

	static getInstance() {
		if (SocketHandler.SOCKET_HANDLER == undefined || SocketHandler.SOCKET_HANDLER == null) {
			SocketHandler.SOCKET_HANDLER = new SocketHandler();
		}

		return SocketHandler.SOCKET_HANDLER;
	}
}

export { SocketHandler };