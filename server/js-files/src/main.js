//Can't fix this yet
import {$, jQuery} from './libs/jquery-3.1.1.js';

import { connectSocket, setupChat, setStatusUpdateCallbacks } from './socket/handle-socket';
import { setupPageUI } from './ui/pixi/setup-ui';


//  Sets up client elements, hooks up callbacks to enable event-driven reponses, then asks the server for a map update
function performSetup () {
	console.log ("Starting client..");
	
	//connectSocket();
	//setupPageUI();
	//setupChat();
	//setStatusUpdateCallbacks();

	//socket.emit('map-data-request');
}

console.log("Awaiting page load..");

//	Initialises the client setup once the HTML page loads
$(document).on('ready', performSetup);
