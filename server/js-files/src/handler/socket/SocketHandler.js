//import { as io} from 'libs/io.io.js';

import io from 'socket.io-client';
import { MessageHandler } from 'src/handler/socket/MessageHandler.js';

const CONNECTION_EVENT = 'connect';
const CONNERROR_EVENT = 'connect_error';
const DISCONNECTION_EVENT = 'disconnect';
const RECONNECTION_EVENT = 'reconnect'
const ERROR_NOSOCKET = new Error('SocketIO Socket is not connected to the game server!')

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

		if (this.io.connected) {
			// We can send an event without data in some cases
			if (messageData == undefined) {
				this.io.emit(eventType);
			} else if (messageData !== undefined && messageData !== '' && messageData !== null) {
				this.io.emit(eventType, MessageHandler.createDataMessage(messageData));
			}
			console.log(' Emitted: ' + eventType);
		} else {
			throw ERROR_NOSOCKET
		}

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
			this.emit('movement-command', messagePayload);
		} else {
			console.log('Session info missing for movement command.');
		}
	}

	//	Send the user's password to the sever
	sendAuthentication (username, passwordFieldVal) {
		this.emit('client-auth', {'username': username, 'password': passwordFieldVal});
	}

	validateSessionId(currentSid) {
		console.log('Validating current SID: ' + currentSid);
		// Bypass our nice emit wrappering
		this.io.emit('validate-sid', currentSid)
	}

	handleDisconnect() {
		console.log('SocketIO Socket disconnected.');
	}

	handleReconnect() {
		//TODO Maybe handle this?
	}

	connectSocket (url) {
		return new Promise ( (resolve, reject ) => {
			console.log('[SocketHandler] Connecting to the game server...');

			//	Try to connect, this must be first
			this.io = io.connect(url);

			this.io.on(CONNERROR_EVENT, reject);
			this.io.on(DISCONNECTION_EVENT, () =>{ this.handleDisconnect() });
			this.io.on(RECONNECTION_EVENT, () =>{ this.handleReconnect() });

			// Call us back when we really connect
			this.io.on(CONNECTION_EVENT, () => {
				console.log('SocketIO Socket connected.');
				resolve(this.io);
			});
		});
	}

	reconnectSocket(url, callback) {
		this.io.disconnect();
		this.connectSocket(url, callback);
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