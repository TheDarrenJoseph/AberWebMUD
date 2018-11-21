import $ from 'libs/jquery.js';

// Class ID mappings
var htmlWindows = { messageWindowId: '#message-window', statWindowId: '#stat-window', inventoryWindowId: '#inventory-window' };

export var UI_ENABLED = false;

//	General UI Page View
export class PageView {
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
