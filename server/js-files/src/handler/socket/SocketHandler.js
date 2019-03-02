//import { as io} from 'libs/socket.io.js';

import io from 'socket.io-client';

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

//import io from 'socket.io-client';
// var socket = io();

//	Static Helper class
//	A collection of SocketIO management functions
class SocketHandler {
	
	constructor (pageController) {
		this.socket = new io();
	}
	
	isSocketConnected () {
		return this.socket.connected;
	}
	
	emit(eventType, messageData) {
		// We can send an event without data in some cases
		if (messageData == undefined) {
			this.socket.emit(eventType);
		} else if (messageData !== undefined  && messageData !== '' && messageData !== null) {
			this.socket.emit(eventType, MessageHandler.createDataMessage(messageData));
		} 
	}
	
	bind(event, callback) {
		this.socket.on(event,callback);
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
			this.socket.emit('movement-command', messagePayload);
		} else {
			console.log('Session info missing for movement command.');
		}
	}

	//	Send the user's password to the sever
	sendAuthentication (username, passwordFieldVal) {
		this.socket.emit('client-auth', {'username': username, 'password': passwordFieldVal});
	}

	connectSocket (url, callback) {
		console.log('[SocketHandler] Connecting to the game server...');

		//	Try to connect
		this.socket = io.connect(url);
		// Call us back when we really connect
		this.socket.on('connect', callback);
	}

	//	Handlers for socket events
	handleSessionError () {
		console.log('Session Error!');
	}
}

export { SocketHandler };
export default SocketHandler;
