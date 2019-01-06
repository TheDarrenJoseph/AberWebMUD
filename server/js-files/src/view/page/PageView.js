import $ from 'libs/jquery.js';

import { _STATS_WINDOW_ID } from 'src/view/page/PageStatsDialogView.js';


// Class ID mappings
var htmlWindows = { messageWindowId: '#message-window', statWindowId: '#'+_STATS_WINDOW_ID, inventoryWindowId: '#inventory-window' };

export var UI_ENABLED = false;
const _MAIN_WINDOW_ID = 'main-window';

//	General UI Page View
// This is the main page view and builds the parent div for all others
export class PageView {
	
	// Creates the HTML for this view if needed
	static buildView () {
		var mainWindowJquery = $('#'+_MAIN_WINDOW_ID);
		var mainWindowExists = mainWindowJquery.length > 0;
		
		if (!mainWindowExists) {
			var mainWindow = document.createElement('div');
			mainWindow.setAttribute('id',_MAIN_WINDOW_ID);
			
			document.body.appendChild(mainWindow);
		}
	}
	
	static destroyView() {
		var mainWindowJquery = $('#'+_MAIN_WINDOW_ID);
		var mainWindowExists = mainWindowJquery.length > 0;
		if (mainWindowExists) {
			// Remove all that match from the DOM
			$(mainWindowJquery).remove();
		}
	}
	
	static getMainWindowJquery() {
		return $('#'+_MAIN_WINDOW_ID);
	}
	
	static showWindow (dialog) {
		$(htmlWindows[dialog]).show();
	}

	static hideWindow (dialog) {
		$(htmlWindows[dialog]).hide();
	}

	static hideWindows () {
		for (var windowId in htmlWindows) {
			this.hideWindow(windowId);
		}
	}

	static toggleWindow (dialog) {
		var thisWindow = $(htmlWindows[dialog]);
		//	Check if the dialog is visible to begin with
		var toHide = thisWindow.is(':visible');

		$('.dialog:visible').hide();

		if (toHide) {
			thisWindow.hide();
		} else {
			thisWindow.show();
		}
	}

	static bindStageClick (enabled, clickedFunction) {
		var mainWindow = $('#main-window');
		if (enabled) {
			mainWindow.on('click', clickedFunction);
		} else {
			mainWindow.unbind('click');
		}
	}
	static toggleStatWinVisibility () {
		PageView.toggleWindow('statWindowId');
	}

	static toggleIventoryWinVisibility () {
		PageView.toggleWindow('inventoryWindowId');
	}

	static toggleConsoleVisibility () {
		PageView.toggleWindow('messageWindowId');
	}

	static appendToConsoleButtonClass (contextButtons) {
		$('#console-button').append(contextButtons);
	}

	static appendToMainWindow (content) {
		$('#main-window').append(content);
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
