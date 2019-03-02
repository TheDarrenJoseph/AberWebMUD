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
	
	constructor(characterConfirmedCallback, pageView, pageStatsDialogView, pageChatView) {
		// Only perform setup once
		this.isSetup   = false;
		this.uiEnabled = false;
		this.characterConfirmedCallback = characterConfirmedCallback;

		if (pageView == undefined) {
			this.pageView = new PageView();
		} else {
			this.pageView = pageView;
		}

		if (pageStatsDialogView == undefined) {
			this.pageStatsDialogView = new PageStatsDialogView(this.pageView);
		} else {
			this.pageStatsDialogView = pageStatsDialogView;
		}


		if (pageChatView == undefined) {
			this.pageChatView = new PageChatView(this.pageView);
		} else {
			this.pageChatView = pageChatViews;
		}

	}
	
	// Builds UI Components
	setupUI () {
		if (!this.isSetup) {
			// Ensure our HTML DOM content is built
			this.pageView.buildView();
			this.pageStatsDialogView.buildView();
			this.pageChatView.buildView();
		}

	}

	// boolean switch for message / password sending
	bindMessageInputPurpose (messageInput) {
		if (messageInput === true) {
			this.pageChatView.bindMessageButton(this.messageFieldKeyupTrigger);
		}

		if (messageInput === false) {
			this.pageChatView.bindMessageButton(this.passwordFieldKeyupTrigger);
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
			this.pageStatsDialogView.requestCharacterDetails();
		} else {
			this.characterConfirmedCallback();
		}
	}
	
	handlePlayerLoginError (data) {
		if (data['playerExists']) {
			this.pageChatView.updateMessageLog(LOGIN_FAILURE_MESSAGE_PWD, 'server');
		} else {
			this.pageChatView.updateMessageLog(LOGIN_FAILURE_MESSAGE_PLAYER, 'server');
		}
	}

	handleCharacterUpdateResponse (data) {
		if (ValidationHandler.isValidCharacterUpdateData(data)) {
			if (data['success'] === true) {
				
				let charData = data['char-data'];
				this.saveCharacterData(charData);

				SessionController.updateClientSessionData(data);
				this.pageStatsDialogView.updateStatsInfoLog(CHARACTER_UPDATE_SUCCESS_MESSAGE, 'server');
								
				//	If this is our first update, trigger the UI startup
				if (!SessionController.characterDetailsExist()) {
					this.characterConfirmedCallback();
				}
			} else { 
				this.pageStatsDialogView.updateStatsInfoLog(CHARACTER_UPDATE_FAILURE_MESSAGE, 'server');
			}
			
		} else {
			throw new RangeError(INVALID_JSON_CHARACTER_UPDATE);
		}
	}

	saveCharacterData (characterData) {
		if (ValidationHandler.isValidCharacterData(characterData)) {
			this.pageStatsDialogView.setStatsFromJsonResponse(characterData);
			return true;
		} else {
			throw new RangeError(INVALID_JSON_CHARACTER_DATA);
			return false;
		}
	}

	bindEvents () {
		this.bindMessageInputPurpose(true);
		this.pageStatsDialogView.bindSaveCharacterDetails(this.sendCharDetails);
	}

	sendCharDetails () {
		let attribs = this.pageStatsDialogView.getStats();
		SocketHandler.sendCharacterDetails(attribs);
		console.log('Character details sent for saving..');
		this.pageStatsDialogView.updateStatsInfoLog('Character details submitted (unsaved).', 'client');
	}

	//	Handles a movement response (success/fail) for this client's move action
	handleMovementResponse (responseJSON) {
		var success = responseJSON['success'];

		//	Let the player know if their move is invalid/unsuccessful
		if (!success) {
			this.pageChatView.updateMessageLog(MOVEMENT_FAILURE_MESSAGE, 'server');
		}
	}

	submitChatMessage () {
		SocketHandler.sendNewChatMessage(this.pageChatView.getMessageInput());
		this.pageChatView.clearMessageInputField();
	}

	submitPassword () {
		var username = SessionController.getSessionInfoJSON().username;
		var passwordInput = this.pageChatView.getPasswordInput();

		if (username !== null && passwordInput !== '') {
			SocketHandler.sendAuthentication(username, passwordInput);
			this.pageChatView.endPasswordSubmission();
			//	Set the send button behavior back to normal (isText)
			this.bindMessageInputPurpose(true);
			
		} else {
			this.pageChatView.updateMessageLog(INVALID_LOGIN_MESSAGE, 'client');
		}
	}

	//Triggered once a user sends a login message
	// Prompts for a user password
	// Username - String username
	// If newUser is true, we give a new account message.
	// Otherwise provides a login style text-prompt.
	requestUserPassword (newUser) {
		this.pageChatView.showPasswordInput();

		if (newUser === true) {
			this.pageChatView.setMessageLog('Creating a new user, please enter a password for it: ');
		} else {
			this.pageChatView.setMessageLog('Please enter your password: ');
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
			this.pageView.submitPassword();
		}
	}

	bindStageClick (enabled) {
		this.pageView.bindStageClick(enabled, PixiController.stageClicked);
	}

	disableUI () {
		if (this.uiEnabled) {
			this.bindStageClick(false); //	Turns off stage-click input
			this.uiEnabled = false;
		}
	}
	
	// Idempotent UI Enabling
	enableUI () {
		if (!this.uiEnabled) {
			this.setupUI();
			this.bindStageClick(true); //	Activate movement click input
			this.uiEnabled = true;
			
			//	Hookup message sending and other controls
			this.bindEvents(); 
		}
	}
	
	isUIEnabled () {
		return this.uiEnabled;
	}
}

export { PageController };
