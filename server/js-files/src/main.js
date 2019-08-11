import jquery from 'jquery';
//import $ from 'libs/jquery.js';
import { GameController, GameControllerClass } from 'src/controller/GameController.js';

console.log('=== AberWebMUD Web Client ===');
console.log('Awaiting page load..');

function runGame() {
	GameController.connect();

	let viewController = GameController.getViewController();
	let pixiController = viewController.getPixiController();
	let mapController = pixiController.getMapController();

	let pixiMapView = mapController.getPixiMapView();

	viewController.loginPrompt();

	console.log('Attempting map draw..')
	pixiMapView.drawMapTiles().then(() => {
		console.log('Map drawn..')
	}).catch(rejection => {
		console.log('Map drawing rejected: ' + rejection);
	});

}

function main() {
	//clientController.performSetup(); 
	GameController.viewController.setupUI()
	.then(runGame)
	.catch(reason => console.error(reason));
}

//	Initialises the client setup once the HTML page loads
jquery(document).ready(main);
