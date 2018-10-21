import $ from 'libs/jquery.js';

import { PageChatView } from 'src/view/page/PageChatView.js';
import { PageStatsDialogView } from 'src/view/page/PageStatsDialogView.js';
import { SessionController } from 'src/controller/SessionController.js';

// Class ID mappings
var htmlWindows = { messageWindowId: '#message-window', statWindowId: '#stat-window', inventoryWindowId: '#inventory-window' };

export var UI_ENABLED = false;

//	General UI Page View
class PageView {
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

	//	data -- 'username':username,'sessionId':sid, 'character':thisPlayer
	static handlePlayerLogin (data) {
		//	console.log(data);
		SessionController.updateClientSessionData(data);
		PageStatsDialogView.checkCharacterDetails(); //	Check/Prompt for character details
	}

	static handlePlayerLoginError (data) {
		console.log(data);
		if (data['playerExists']) {
			PageChatView.updateMessageLog('Login failure (bad password)', 'server');
		} else {
			PageChatView.updateMessageLog('Login failure (player does not exist)', 'server');
		}
	}

	static appendToConsoleButtonClass (contextButtons) {
		$('#console-button').append(contextButtons);
	}

	static appendToMainWindow (content) {
		$('#main-window').append(content);
	}
}

export { PageView };
