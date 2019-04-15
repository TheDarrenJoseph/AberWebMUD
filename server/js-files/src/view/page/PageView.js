import jquery from 'jquery';

//import $ from 'libs/jquery.js';
import { EventMapping } from 'src/helper/EventMapping.js';

//export var this.doc = document;
//export var this.doc = document.implementation.createHTMLDocument('PageView');

//	General UI Page View
// This is the main page view and builds the parent div for all others
//	Binding to click / key events using jQuery and controlling the overall UI elements
export class PageView extends EventMapping {

	constructor(pageModel) {
		super();

		// Class ID mappings
		this.htmlWindows = { mainWindowId: '#main-window', messageWindowId: '#message-window', inventoryWindowId: '#inventory-window' };
		this._MAIN_WINDOW_ID = 'main-window';

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
			this.getMainWindowJquery().append(domElement);
		} else {
			throw new Error("Cannot append to non-existent main window DOM Element.");
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
	buildMainWindow() {
		if (this.getMainWindow() == null) {
			var mainWindow = this.doc.createElement('div');
			mainWindow.setAttribute('id',this._MAIN_WINDOW_ID);
			this.appendToDocumentBody(mainWindow);
		}
	}

	/**
	 * Removes the main window div
	 */
	destroyMainWindow() {
		if (this.getMainWindow() !== null) {
			let mainWindowJquery = this.getMainWindowJquery();
			// Remove all that match from the DOM
			jquery(mainWindowJquery).remove();
		}
	}

	/**
	 * Builds any needed DOM Elements
	 */
	buildView () {
		this.buildMainWindow();
	}

	/**
	 * Deconstructs any DOM Elements this view creates
	 */
	destroyView() {
		this.destroyMainWindow();
	}
	
	getMainWindowJquery() {
		return jquery('#'+this._MAIN_WINDOW_ID, this.doc);
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

		jquery('.dialog:visible', this.doc).hide();

		if (toHide) {
			thisWindow.hide();
		} else {
			thisWindow.show();
		}
	}

	bindStageClick (enabled, clickedFunction) {
		let mainWindow = jquery(this.htmlWindows[this._MAIN_WINDOW_ID]);
		mainWindow.on('click', clickedFunction);
	}
	
	unbindStageClick () {
		let mainWindow = jquery(this.htmlWindows[this._MAIN_WINDOW_ID]);
		mainWindow.unbind('click');
	}
	
	toggleStatWinVisibility () {
		this.toggleWindow('statWindowId');
	}

	toggleIventoryWinVisibility () {
		this.toggleWindow('inventoryWindowId');
	}

	toggleConsoleVisibility () {
		this.toggleWindow('messageWindowId');
	}

	appendToConsoleButtonClass (contextButtons) {
		jquery('#console-button', this.doc).append(contextButtons);
	}

	appendToMainWindow (content) {
		jquery('#main-window', this.doc).append(content);
	}

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
