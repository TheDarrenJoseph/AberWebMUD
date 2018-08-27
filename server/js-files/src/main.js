import $ from 'libs/jquery-3.1.1.js';
import { SocketHandler } from 'src/handler/socket/handle-socket';
//	import { setupPageUI } from './ui/pixi/setup-ui';

console.log('=== AberWebMUD Web Client ===')

//  Sets up client elements, hooks up callbacks to enable event-driven reponses, then asks the server for a map update
function performSetup () {
	console.log('Starting client..');

	//Get the general UI ready
	//setupPageUI();

	var connected = SocketHandler.connectSocket();
	if (connected) {
		//setupChat();
		//setStatusUpdateCallbacks();
		//socket.emit('map-data-request');
	}
}

console.log("Awaiting page load..");
//	Initialises the client setup once the HTML page loads
$(document).ready(performSetup);
