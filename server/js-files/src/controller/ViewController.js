import { EVENTS as PIXIVIEW_EVENTS, PixiView } from 'src/view/pixi/PixiView.js';
import { PixiController } from 'src/controller/pixi/PixiController.js';
import { Session } from 'src/model/Session.js';
import { PageController } from 'src/controller/page/PageController.js';
import { PageView } from 'src/view/page/PageView.js';
import { _STATS_WINDOW_ID } from 'src/view/page/PageCharacterDetailsView.js';

export default class ViewController {

	constructor (doc) {

		if (doc !== undefined) {
			this.pageController = new PageController(doc);
		} else {
			this.pageController = new PageController();
		}

		this.pixiController = new PixiController(PageView.getWindowDimensions(), this.pageController);

		// Extract the view for now
		this.pageView = this.pageController.pageView;
	}

	getPageController() {
		return this.pageController;
	}

	getPixiController() {
		return this.pixiController;
	}

	resetChatWindow() {
		if (this.pageController.isSetup) {
			this.pageController.getPageChatView().clearMessageLog();
			// this.pageController.getPageChatView().hidePasswordInput();
		}
	}

	/**
	 * Construct everything needed for the view
	 * @returns {Promise<any>}
	 */
	setupUI() {
		return new Promise( (resolve, reject) => {
			//	Get the general UI ready
			let canvasViewPromise = this.pixiController.setupUI();
			canvasViewPromise.then( canvasView => {
				console.log('ViewController intialised: ' + canvasView);
				this.canvasView = canvasView;

				// this.pageController.enableUI();
				this.pageController.setupUI();
				this.pageController.pageView.appendToGameWindow(this.canvasView);

				this.resetChatWindow();
				resolve(canvasView);
			}).catch(reject);
		});

		/* Not sure if this is needed, drags Pixi Sprite Buttons onto a Page div?
			this.pageController.pageView.appendToConsoleButtonClass(this.pixiController.pixiView.statsButtonSprite);
			this.pageController.pageView.appendToConsoleButtonClass(this.pixiController.pixiView.inventoryButtonSprite);
		*/
	}

	/**
	 * Shows all UI elements relevant for user login
	 */
	loginPrompt() {
		this.pageController.enableUI();
		this.pageController.showLogin();
	}

	/**
	 * Turn on various view components
	 */
	enableUI () {
		this.pageController.enableUI();
		this.pixiController.enableUI();
	}

	/**
	 * Continues the login process once we've set/retrieved character details
	 */
	characterDetailsConfirmed () {
		console.log('CHARDETAILS CONFIRMED, session data: ' + Session.ActiveSession.clientSession);

		//	Hide the stats window
		this.pageView.hideElement(_STATS_WINDOW_ID);

		// Show whatever player position is stored on the session model
		let mapCharacter = Session.ActiveSession.getPlayer().getMapCharacter();
		let characterPosition = mapCharacter.getCharacterDetails().getPosition();
		this.pixiController.getMapController().showMapPosition(characterPosition[0],characterPosition[1]);

		//	Creates the new character to represent the player
		// TODO Add a player and draw them
	}

	bindComponents() {
		this.pageController.pageView.bindStageClick(this.pixiController.stageClicked);

		let pixiView = this.pixiController.pixiView;

		// Map Pixi Button clicks to HTML Window toggling
		pixiView.on(PIXIVIEW_EVENTS.CONSOLE_BUTTONCLICK, () => { this.pageController.pageChatView.toggleConsoleVisibility() });
		pixiView.on(PIXIVIEW_EVENTS.INVENTORY_BUTTONCLICK, () => { this.pageController.pageInventoryView.toggleInventoryWinVisibility() });
		pixiView.on(PIXIVIEW_EVENTS.STATS_BUTTONCLICK, () => { this.pageController.pageCharacterDetailsView.toggleStatWinVisibility() });

		// EventMappings
		// Once the character details are set, confirm that we have some
		this.pageController.onceCharacterDetailsConfirmed(() => { this.characterDetailsConfirmed() });
	}

}

export { ViewController };