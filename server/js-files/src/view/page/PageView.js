import jquery from 'jquery';

//import $ from 'libs/jquery.js';
import { EventMapping } from 'src/helper/EventMapping.js';

//export var this.doc = document;
//export var this.doc = document.implementation.createHTMLDocument('PageView');

var EVENTS = {};

const _MAIN_WINDOW_ID = 'main-window';
const _GAME_WINDOW_ID = 'game-window';

//	General UI Page View
// This is the main page view and builds the parent div for all others
//	Binding to click / key events using jQuery and controlling the overall UI elements
export class PageView extends EventMapping {

	constructor(pageModel) {
		super(EVENTS);

		// Class ID mappings
		this.htmlWindows = { mainWindowId: '#main-window', messageWindowId: '#message-window', inventoryWindowId: '#inventory-window' };

		if (pageModel == undefined ) {
			throw new RangeError('Page Model undefined.');
		}

		if (pageModel.doc == undefined) {
			throw new RangeError('Page Model Document undefined.');
		}

		this.pageModel = pageModel;
		this.doc = this.pageModel.doc;
	}

	/**
	 * Append a DOM Element to the document body of this view
	 * @throws an Error if the main window does not exist
	 */
	appendToMainWindow(domElement) {
		if (this.getMainWindow() !== null) {
			if (domElement instanceof Element) {
				console.log('Appending element to the main window: ' + domElement.id);
				this.getMainWindowJquery().append(domElement);
			} else {
				console.log('Wrapping main window element in a new div');
				let newDiv = this.doc.createElement('div');
				newDiv.append(domElement);
				this.getMainWindowJquery().append(domElement);
			}
		} else {
			throw new Error("Cannot append to non-existent main window DOM Element.");
		}
	}

	/**
	 * Append a DOM Element to the document body of this view
	 * @throws an Error if the main window does not exist
	 */
	appendToGameWindow(domElement) {
		if (this.getGameWindow() !== null) {
			if (domElement instanceof Element) {
				console.log('Appending element to the main window: ' + domElement.id);
				this.getGameWindowJquery().append(domElement);
			} else {
				console.log('Wrapping game window element in a new div');
				let newDiv = this.doc.createElement('div');
				newDiv.append(domElement);
				this.getGameWindowJquery().append(domElement);
			}
		} else {
			throw new Error("Cannot append to non-existent game window DOM Element.");
		}
	}

	/**
	 * Append a DOM Element to the document body of this view
	 */
	appendToDocumentBody(element) {
		this.doc.body.appendChild(element);
	}

	/**
	 * Builds the main window div
	 */
	buildView() {
		let mainWindow = this.getMainWindow();
		let gameWindow = this.getGameWindow();

		if (mainWindow == null) {
			console.log('Creating main window..');
			mainWindow = this.doc.createElement('div');
			mainWindow.setAttribute('id', _MAIN_WINDOW_ID);
			this.appendToDocumentBody(mainWindow);
		}

		if (mainWindow !== null && gameWindow == null) {
			console.log('Creating game window..');
			gameWindow = this.doc.createElement('div');
			gameWindow.setAttribute('id',_GAME_WINDOW_ID);
			mainWindow.appendChild(gameWindow);
		}

	}

	/**
	 * Removes the main window div
	 */
	destroyView() {
		if (this.getMainWindow() !== null) {
			let mainWindowJquery = this.getMainWindowJquery();
			// Remove all that match from the DOM
			jquery(mainWindowJquery).remove();
		}
	}

	getMainWindowJquery() {
		return jquery('#'+_MAIN_WINDOW_ID, this.doc);
	}

	getGameWindowJquery() {
		return jquery('#'+_GAME_WINDOW_ID, this.doc);
	}

	/**
	 * Returns the first DOM Element for the main window jQuery selector
	 */
	getMainWindow() {
		let mainWindowJquery = this.getMainWindowJquery();
		let mainWindowExists = mainWindowJquery.length > 0;

		if (mainWindowExists) {
			return mainWindowJquery[0];
		} else {
			return null;
		}
	}

	/**
	 * Returns the first DOM Element for the main window jQuery selector
	 */
	getGameWindow() {
		let gameWindowJquery = this.getGameWindowJquery();
		let gameWindowExists = gameWindowJquery.length > 0;

		if (gameWindowExists) {
			return gameWindowExists[0];
		} else {
			return null;
		}
	}

	showWindow (dialog) {
		jquery(this.htmlWindows[dialog], this.doc).show();
	}

	hideWindow (dialog) {
		jquery(this.htmlWindows[dialog], this.doc).hide();
	}

	hideWindows () {
		for (var windowId in this.htmlWindows) {
			this.hideWindow(windowId);
		}
	}

	toggleWindow (dialog) {
		var thisWindow = jquery(this.htmlWindows[dialog]);
		//	Check if the dialog is visible to begin with
		var toHide = thisWindow.is(':visible');

		//jquery('.dialog:visible', this.doc).hide();

		if (toHide) {
			thisWindow.hide();
		} else {
			thisWindow.show();
		}
	}

	bindStageClick (clickedFunction) {
		let mainWindow = jquery(this.htmlWindows[_MAIN_WINDOW_ID]);
		mainWindow.on('click', clickedFunction);
	}
	
	unbindStageClick () {
		let mainWindow = jquery(this.htmlWindows[_MAIN_WINDOW_ID]);
		mainWindow.unbind('click');
	}
	
	toggleStatWinVisibility () {
		this.toggleWindow('statWindowId');
	}

	toggleInventoryWinVisibility () {
		this.toggleWindow('inventoryWindowId');
	}

	toggleConsoleVisibility () {
		this.toggleWindow('messageWindowId');
	}

	/*
	appendToConsoleButtonClass (contextButtons) {
		jquery('#console-button', this.doc).append(contextButtons);
	}*/

	static getWindowDimensions () {
		// Set our mapWindowSize to the smallest of our page dimensions
		// Using the smallest dimension to get a square
		// Then use 90% of this value to leave some space
		if (window.innerHeight < window.innerWidth) {
			return window.innerHeight;
		} else {
			return window.innerWidth;
		}
	}
}

//export var PageView = new PageViewClass(document);
