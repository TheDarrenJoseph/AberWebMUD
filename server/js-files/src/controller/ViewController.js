import { EVENTS as PIXIVIEW_EVENTS, PixiView } from 'src/view/pixi/PixiView.js';
import { PixiController } from 'src/controller/pixi/PixiController.js';
import { Session } from 'src/model/Session.js';
import { PageController } from 'src/controller/page/PageController.js';
import { PageView } from 'src/view/page/PageView.js';

export default class ViewController {

	constructor () {
		this.pageController = new PageController();
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
			this.pageController.getPageChatView().hidePasswordInput();
		}
	}

	async setupUI() {
		//	Get the general UI ready
		this.canvasView = await this.pixiController.enableUI();
		this.pageController.enableUI();
		this.pageController.pageView.appendToGameWindow(this.canvasView);

		this.resetChatWindow();

		/* Not sure if this is needed, drags Pixi Sprite Buttons onto a Page div?
			this.pageController.pageView.appendToConsoleButtonClass(this.pixiController.pixiView.statsButtonSprite);
			this.pageController.pageView.appendToConsoleButtonClass(this.pixiController.pixiView.inventoryButtonSprite);
		*/
	}

	/**
	 * Continues the login process once we've set/retrieved character details
	 */
	characterDetailsConfirmed () {
		console.log('CHARDETAILS CONFIRMED, session data: ' + Session.ActiveSession.clientSession);

		//	Hide the stats window
		this.pageView.hideWindow('statWindowId');
		this.setupUI();

		// Show whatever player position is stored on the session model
		this.pixiController.getMapController().showMapPosition(Session.ActiveSession.clientSession.player.getCharacter().pos_x,
		Session.ActiveSession.clientSession.player.getCharacter().pos_y);

		//	Creates the new character to represent the player
		// TODO Add a player and draw them
	}

	bindComponents() {
		this.pageController.pageView.bindStageClick(this.pixiController.stageClicked);


		let pixiView = this.pixiController.pixiView;

		// Map Pixi Button clicks to HTML Window toggling
		pixiView.on(PIXIVIEW_EVENTS.CONSOLE_BUTTONCLICK, () => { this.pageController.pageView.toggleConsoleVisibility() });
		pixiView.on(PIXIVIEW_EVENTS.INVENTORY_BUTTONCLICK, () => { this.pageController.pageView.toggleInventoryWinVisibility() });
		pixiView.on(PIXIVIEW_EVENTS.STATS_BUTTONCLICK, () => { this.pageController.pageView.toggleStatWinVisibility() });

		// EventMappings
		// Once the character details are set, confirm that we have some
		this.pageController.onceCharacterDetailsSet(this.characterDetailsConfirmed);
	}

}

export { ViewController };