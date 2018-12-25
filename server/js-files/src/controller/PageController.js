import PageChatView from 'src/view/page/PageChatView.js';
import PageStatsDialogView from 'src/view/page/PageStatsDialogView.js';

import { PageView } from 'src/view/page/PageView.js';
import { PixiController } from 'src/controller/pixi/PixiController.js';
import SessionController from 'src/controller/SessionController.js';

//	Hooking up to a bunch of other controllers for now
import { Session } from 'src/model/SessionModel.js';

//	We're going to call out to the SocketHandler from here for now
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';

// Static helper class
//	Very loose controller for the Page
//	Binding to click / key events using jQuery and controlling the overall UI elements
export default class PageController {
	static setupUI () {
		PageController.bindEvents(); //	Hookup message sending and other controls
	}

	// boolean switch for message / password sending
	static bindMessageInputPurpose (messageInput) {
		if (messageInput === true) {
			PageChatView.bindMessageButton(PageController.messageFieldKeyupTrigger);
		}

		if (messageInput === false) {
			PageChatView.bindMessageButton(PageController.passwordFieldKeyupTrigger);
		}
	}

	static handlePlayerLoginError (data) {
		console.log(data);
		if (data['playerExists']) {
			PageChatView.updateMessageLog('Login failure (bad password)', 'server');
		} else {
			PageChatView.updateMessageLog('Login failure (player does not exist)', 'server');
		}
	}

	static handleCharacterUpdateResponse (messageJson) {
		if (messageJson['success'] != null) {
			console.log('DETAILS EXIST?: ' + SessionController.characterDetailsExist());
			console.log('UPDATING LOCAL CHARDETAILS using: ' + messageJson);

			if (messageJson['success'] === true) {
				//	If this is our first update, trigger the UI startup
				if (!SessionController.characterDetailsExist()) {
					//	Save the data ready for the UI
					PageView.saveCharacterUpdate(messageJson['char-data']);
					//	Trigger confirmation (uses these stats)
					PageController.characterDetailsConfirmed();
				} else {
					PageController.saveCharacterUpdate(messageJson['char-data']);
				}
			} else {
				PageStatsDialogView.updateStatsInfoLog('Invalid character details/update failure', 'server');
			}
		}
	}

	static saveCharacterUpdate (characterData) {
		//	Update local stats window from the message
		PageStatsDialogView.setStatsFromJsonResponse(characterData);
		SessionController.updateClientSessionData(characterData);
		PageStatsDialogView.updateStatsInfoLog('Character details saved.', 'server');
	}

	static bindEvents () {
		PageController.bindMessageInputPurpose(true);
		PageStatsDialogView.bindSaveCharacterDetails(PageController.sendCharDetails);
	}

	static sendCharDetails () {
		SocketHandler.sendCharacterDetails(PageStatsDialogView.getStats());
	}

	static checkConnection () {
		// Hide everything if we lose connection
		if (!SocketHandler.isSocketConnected()) {
			PageView.hideWindows();
			PageView.showControls(false);
			PageView.showDialog();
			PageChatView.updateMessageLog('Connection lost to server!', 'client');
		}
	}

	//	Handles a movement response (success/fail) for this client's move action
	static handleMovementResponse (responseJSON) {
		var success = responseJSON['success'];

		//	Let the player know if their move is invalid/unsuccessful
		if (!success) {
			PageChatView.updateMessageLog('You cannot move there!', 'server');
		}
	}

	static submitChatMessage () {
		SocketHandler.sendNewChatMessage(PageChatView.getMessageInput());
		PageChatView.clearMessageInputField();
	}

	static submitPassword () {
		var username = SessionController.getSessionInfoJSON().username;
		var passwordInput = PageChatView.getPasswordInput();

		if (username !== null && passwordInput !== '') {
			SocketHandler.sendAuthentication(username, passwordInput);
			PageChatView.endPasswordSubmission();
		} else {
			PageChatView.updateMessageLog('Invalid password.', 'client');
		}
	}

	//	Triggered once a user sends a login message, asks for user password
	//	username is a username string
	static requestUserPassword (username) {
		PageChatView.showPasswordInput();

		if (username !== undefined) {
			Session.username = username; //	Set the current session username
			PageChatView.setMessageLog('Please enter the password for user ' + username);
		} else {
			PageChatView.setMessageLog('Account created, please enter your password');
		}

		PageController.bindMessageInputPurpose(false); //	Set the send message behaviour to password sending
	}

	static userDoesNotExist (username) {
		var newUser = window.confirm('User does not exist, do you want to create it?');
		if (newUser) PageController.requestUserPassword(username);
	}

	static messageFieldKeyupTrigger (evnt) {
		if (evnt.keyCode === 13) { //	Enter key check
			console.log('ENTER on messagefield');
			PageController.submitChatMessage();
		}
	}

	static passwordFieldKeyupTrigger (evnt) {
		if (evnt.keyCode === 13) { //	Enter key check
			console.log('ENTER on passwordfield');
			PageView.submitPassword();
		}
	}

	static bindStageClick (enabled) {
		PageView.bindStageClick(enabled, PixiController.stageClicked);
	}

	static disableUI () {
		PageController.bindStageClick(false); //	Turns off stage-click input
		PageView.showControls(false); //	Hides major controls
		PixiController.renderStage(); // Re-renders the stage to show blank
	}

	static enableUI () {
		PageController.bindStageClick(true); //	Activate movement click input
		PageView.showControls(true); //	Shows major controls
		PixiController.renderStage();
	}
}
