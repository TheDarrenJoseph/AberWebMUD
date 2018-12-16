import $ from 'libs/jquery.js';
import { GameController } from 'src/controller/GameController.js';

console.log('=== AberWebMUD Web Client ===');
console.log('Awaiting page load..');

var clientController = new GameController();
clientController.checkCharacterDetails();

//	Initialises the client setup once the HTML page loads
$(document).ready(clientController.performSetup);
