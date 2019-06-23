import jquery from 'jquery';
//import $ from 'libs/jquery.js';
import { GameController, GameControllerClass } from 'src/controller/GameController.js';

console.log('=== AberWebMUD Web Client ===');
console.log('Awaiting page load..');

function main() {
	//clientController.performSetup(); 
	GameController.viewController.setupUI().then( () => {
		GameController.connect();

	}).catch(reason => console.error(reason));
}

//	Initialises the client setup once the HTML page loads
jquery(document).ready(main);
