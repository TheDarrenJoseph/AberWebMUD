import PageChatView from 'src/view/page/PageChatView.js';
import PageStatsDialogView from 'src/view/page/PageStatsDialogView.js';
import ValidationHandler from 'src/handler/ValidationHandler.js';

import { PageView } from 'src/view/page/PageView.js';
import { PixiController } from 'src/controller/pixi/PixiController.js';
import SessionController from 'src/controller/SessionController.js';

//	Hooking up to a bunch of other controllers for now
import { Session } from 'src/model/Session.js';

//	We're going to call out to the SocketHandler from here for now
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';

const ENTER_KEY_EVENT_CODE = 13;

export var LOGIN_FAILURE_MESSAGE_PWD = 'Login failure (bad password)';
export var LOGIN_FAILURE_MESSAGE_PLAYER = 'Login failure (player does not exist)';

export var INVALID_JSON_CHARACTER_UPDATE = 'Invalid character update response JSON';
export var INVALID_JSON_CHARACTER_DATA = 'Invalid character data response JSON';
export var CHARACTER_UPDATE_SUCCESS_MESSAGE = 'Character details saved.';
export var CHARACTER_UPDATE_FAILURE_MESSAGE = 'Invalid character details/update failure';
export var MOVEMENT_FAILURE_MESSAGE = 'You cannot move there!';
export var INVALID_LOGIN_MESSAGE = 'Invalid username/password.';

// Static helper class
//	Very loose controller for the Page
//	Binding to click / key events using jQuery and controlling the overall UI elements
export default class PageController {
	
	constructor(characterConfirmedCallback) {
		this.uiEnabled = false;
		this.characterConfirmedCallback = characterConfirmedCallback;
	}
	
	setupUI () {
		// Ensure our HTML DOM content is built
		PageView.buildView();
		PageStatsDialogView.buildView();
		PageChatView.buildView();
		//	Hookup message sending and other controls
		this.bindEvents(); 
		
		// DEBUG
		// console.log('View built');
		// console.log(PageView.getMainWindowJquery()[0]);
	}

	// boolean switch for message / password sending
	bindMessageInputPurpose (messageInput) {
		if (messageInput === true) {
			PageChatView.bindMessageButton(this.messageFieldKeyupTrigger);
		}

		if (messageInput === false) {
			PageChatView.bindMessageButton(this.passwordFieldKeyupTrigger);
		}
	}

	//	data -- 'username':username,'sessionId':sid, 'character':thisPlayer
	handlePlayerLogin (data) {
		// Save this data for our session
		SessionController.updateClientSessionData(data);
		//	Check/Prompt for character details
		this.checkCharacterDetails(); 
	}
	
	//	Checks that the player's character details are set
	//	and asks them to set them if false
	checkCharacterDetails () {
		if (!SessionController.characterDetailsExist()) {
			PageStatsDialogView.requestCharacterDetails();
		} else {
			this.characterConfirmedCallback();
		}
	}
	
	handlePlayerLoginError (data) {
		console.log(data);
		if (data['playerExists']) {
			PageChatView.updateMessageLog(LOGIN_FAILURE_MESSAGE_PWD, 'server');
		} else {
			PageChatView.updateMessageLog(LOGIN_FAILURE_MESSAGE_PLAYER, 'server');
		}
	}

	handleCharacterUpdateResponse (data) {
		if (ValidationHandler.isValidCharacterUpdateData(data)) {
			if (data['success'] === true) {
				//	Save the data ready for the UI
				this.saveCharacterData(data['char-data']);
				
				//	If this is our first update, trigger the UI startup
				if (!SessionController.characterDetailsExist()) {
					this.characterConfirmedCallback();
				}
			} else { 
				PageStatsDialogView.updateStatsInfoLog(CHARACTER_UPDATE_FAILURE_MESSAGE, 'server');
			}
			
		} else {
			throw new RangeError(INVALID_JSON_CHARACTER_UPDATE);
		}
	}

	saveCharacterData (characterData) {
		console.log('attempting to save:'+JSON.stringify(characterData))
		
		if (ValidationHandler.isValidCharacterData(characterData)) {
			//	Update local stats window from the message
			PageStatsDialogView.setStatsFromJsonResponse(characterData);
			SessionController.updateClientSessionData(characterData);
			PageStatsDialogView.updateStatsInfoLog(CHARACTER_UPDATE_SUCCESS_MESSAGE, 'server');
		} else {
			throw new RangeError(INVALID_JSON_CHARACTER_DATA);
		}
	}

	bindEvents () {
		this.bindMessageInputPurpose(true);
		PageStatsDialogView.bindSaveCharacterDetails(this.sendCharDetails);
	}

	sendCharDetails () {
		SocketHandler.sendCharacterDetails(PageStatsDialogView.getStats());
	}

	//	Handles a movement response (success/fail) for this client's move action
	handleMovementResponse (responseJSON) {
		var success = responseJSON['success'];

		//	Let the player know if their move is invalid/unsuccessful
		if (!success) {
			PageChatView.updateMessageLog(MOVEMENT_FAILURE_MESSAGE, 'server');
		}
	}

	submitChatMessage () {
		SocketHandler.sendNewChatMessage(PageChatView.getMessageInput());
		PageChatView.clearMessageInputField();
	}

	submitPassword () {
		var username = SessionController.getSessionInfoJSON().username;
		var passwordInput = PageChatView.getPasswordInput();

		if (username !== null && passwordInput !== '') {
			SocketHandler.sendAuthentication(username, passwordInput);
			PageChatView.endPasswordSubmission();
		} else {
			PageChatView.updateMessageLog(INVALID_LOGIN_MESSAGE, 'client');
		}
	}

	//Triggered once a user sends a login message
	// Prompts for a user password
	// Username - String username
	// If newUser is true, we give a new account message.
	// Otherwise rovides a login style text-prompt.
	requestUserPassword (newUser) {
		PageChatView.showPasswordInput();

		if (newUser === true) {
			PageChatView.setMessageLog('Creating a new user, please enter a password for it: ');
		} else {
			PageChatView.setMessageLog('Please enter your password: ');
		}

		this.bindMessageInputPurpose(false); //	Set the send message behaviour to password sending
	}

	messageFieldKeyupTrigger (evnt) {
		if (evnt.keyCode === ENTER_KEY_EVENT_CODE) { //	Enter key check
			// console.log('ENTER on messagefield');
			this.submitChatMessage();
		}
	}

	passwordFieldKeyupTrigger (evnt) {
		if (evnt.keyCode === ENTER_KEY_EVENT_CODE) { //	Enter key check
			// console.log('ENTER on passwordfield');
			PageView.submitPassword();
		}
	}

	bindStageClick (enabled) {
		PageView.bindStageClick(enabled, PixiController.stageClicked);
	}

	disableUI () {
		if (this.uiEnabled) {
			this.bindStageClick(false); //	Turns off stage-click input
			this.uiEnabled = false;
		}
	}

	enableUI () {
		if (!this.uiEnabled) {
			this.bindStageClick(true); //	Activate movement click input
			this.uiEnabled = true;
		}
	}
}

export { PageController };
