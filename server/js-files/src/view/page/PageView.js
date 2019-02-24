import $ from 'libs/jquery.js';

import { _STATS_WINDOW_ID } from 'src/view/page/PageStatsDialogView.js';

// Class ID mappings
var htmlWindows = { mainWindowId: '#main-window', messageWindowId: '#message-window', statWindowId: '#'+_STATS_WINDOW_ID, inventoryWindowId: '#inventory-window' };
const _MAIN_WINDOW_ID = 'main-window';

//export var this.DOCUMENT = document;
//export var this.DOCUMENT = document.implementation.createHTMLDocument('PageView');

//	General UI Page View
// This is the main page view and builds the parent div for all others
export class PageView {
	constructor(doc) {
		// Use the base document if we've not provided one
		if (doc == undefined) {
			doc = document;
		}

		this.DOCUMENT = doc;
		//console.log(this)
	}

	// Creates the HTML for this view if needed
	buildView () {
		var mainWindowJquery = $('#'+_MAIN_WINDOW_ID, this.DOCUMENT);
		var mainWindowExists = mainWindowJquery.length > 0;
		
		if (!mainWindowExists) {
			var mainWindow = this.DOCUMENT.createElement('div');
			mainWindow.setAttribute('id',_MAIN_WINDOW_ID);

			this.DOCUMENT.body.appendChild(mainWindow);
		}
	}
	
	destroyView() {
		var mainWindowJquery = this.getMainWindowJquery();
		var mainWindowExists = mainWindowJquery.length > 0;
		if (mainWindowExists) {
			// Remove all that match from the DOM
			$(mainWindowJquery).remove();
		}
	}
	
	getMainWindowJquery() {
		return $('#'+_MAIN_WINDOW_ID, this.DOCUMENT);
	}
	
	showWindow (dialog) {
		$(htmlWindows[dialog], this.DOCUMENT).show();
	}

	hideWindow (dialog) {
		$(htmlWindows[dialog], this.DOCUMENT).hide();
	}

	hideWindows () {
		for (var windowId in htmlWindows) {
			this.hideWindow(windowId);
		}
	}

	toggleWindow (dialog) {
		var thisWindow = $(htmlWindows[dialog]);
		//	Check if the dialog is visible to begin with
		var toHide = thisWindow.is(':visible');

		$('.dialog:visible', this.DOCUMENT).hide();

		if (toHide) {
			thisWindow.hide();
		} else {
			thisWindow.show();
		}
	}

	bindStageClick (enabled, clickedFunction) {
		var mainWindow = $(htmlWindows['mainWindowId']);
		if (enabled) {
			mainWindow.on('click', clickedFunction);
		} else {
			mainWindow.unbind('click');
		}
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
		$('#console-button', this.DOCUMENT).append(contextButtons);
	}

	appendToMainWindow (content) {
		$('#main-window', this.DOCUMENT).append(content);
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
