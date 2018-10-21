import $ from 'libs/jquery.js';
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';
import { PixiController } from 'src/controller/pixi/PixiController.js';
import { PageController } from 'src/controller/PageController.js';

console.log('=== AberWebMUD Web Client ===');

//  Sets up client elements, hooks up callbacks to enable event-driven reponses, then asks the server for a map update
function performSetup () {
	console.log('Starting client..');

	//	Get the general UI ready
	PageController.setupPageUI();
	PixiController.setupPixiUI();

	var connected = SocketHandler.connectSocket();
	console.log('Socket: ' + connected);
	if (connected) {
		// setupChat();
		// setStatusUpdateCallbacks();
		// socket.emit('map-data-request');
	}
}

console.log('Awaiting page load..');
//	Initialises the client setup once the HTML page loads
$(document).ready(performSetup);
