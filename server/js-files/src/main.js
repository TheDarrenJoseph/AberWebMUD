import $ from 'libs/jquery.js';
import { GameController, GameControllerClass } from 'src/controller/GameController.js';

console.log('=== AberWebMUD Web Client ===');
console.log('Awaiting page load..');

function main() {
	//clientController.performSetup(); 
	GameController.enableUI();
	GameController.connect();

	// GameController.pageController.checkCharacterDetails();
}

//	Initialises the client setup once the HTML page loads
$(document).ready(main);
