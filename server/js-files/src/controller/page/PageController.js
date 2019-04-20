import PageChatView from 'src/view/page/PageChatView.js';
import { EVENTS as pageStatsEvents, PageCharacterDetailsView} from 'src/view/page/PageCharacterDetailsView.js';

import { Page } from 'src/model/page/Page.js';
import { EVENTS as characterDetailsEvents, CharacterDetails } from 'src/model/page/CharacterDetails.js';
import { PageView } from 'src/view/page/PageView.js';

//	Hooking up to a bunch of other controllers for now
import { Session } from 'src/model/Session.js';

//	We're going to call out to the SocketHandler from here for now
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';

import ValidationHandler from 'src/handler/ValidationHandler.js';

const ENTER_KEY_EVENT_CODE = 13;

export var LOGIN_FAILURE_MESSAGE_PWD = 'Login failure (bad password)';
export var LOGIN_FAILURE_MESSAGE_PLAYER = 'Login failure (player does not exist)';

export var INVALID_JSON_CHARACTER_UPDATE = 'Invalid character update response JSON';
export var INVALID_JSON_CHARACTER_DATA = 'Invalid character data response JSON';
export var CHARACTER_UPDATE_SUCCESS_MESSAGE = 'Character details saved.';
export var CHARACTER_UPDATE_FAILURE_MESSAGE = 'Invalid character details/update failure';
export var MOVEMENT_FAILURE_MESSAGE = 'You cannot move there!';
export var INVALID_LOGIN_MESSAGE = 'Invalid username/password.';

//	Very loose controller for the Page
// 	Accepting events from the PageView
export default class PageController {

	/**
	 *
	 * @param doc to allow overriding the default Document interface
	 * @param pageView
	 * @param pageCharacterDetailsView
	 * @param pageChatView
	 */
	constructor(doc, pageView, pageCharacterDetailsView, pageChatView) {

		this.uiEnabled = false;

		this.SOCKET_HANDLER = SocketHandler.getInstance();

		// BIND ME this.characterConfirmedCallback = characterConfirmedCallback;
		this.characterDetails = new CharacterDetails();

		// Use the base document if we've not provided one
		if (doc == undefined) {
			this.doc = document;
		} else {
			this.doc = doc;
		}

		this.pageModel = new Page(this.doc);

		if (pageView == undefined) {
			this.pageView = new PageView(this.pageModel);
		} else {
			this.pageView = pageView;
		}

		if (pageCharacterDetailsView == undefined) {
			this.pageCharacterDetailsView = new PageCharacterDetailsView(this.pageView, this.characterDetails);
		} else {
			this.pageCharacterDetailsView = pageCharacterDetailsView;
		}

		if (pageChatView == undefined) {
			this.pageChatView = new PageChatView(this.pageView);
		} else {
			this.pageChatView = pageChatView;
		}
	}

	bindEvents () {
		this.pageView.bindMessageButton(this.messageFieldKeyupTrigger);

		// Setup binding response for detail saving
		this.pageCharacterDetailsView.on(pageStatsEvents.SAVE_STATS, (data) => {
			this.sendCharDetails(data);
			this.characterDetails.setStatsAttributeValues(data);
		});

		// Setup emitting
		this.pageCharacterDetailsView.bindEvents();

	}

	/**
	 * Checks for character details and calls-back or prompts for them
	 * @param onConfirmedCb callback for if details exist
	 */
	checkCharacterDetails (onConfirmedCb) {
		// If details are not confirmed, hookup our callback
		if (!this.characterDetails.characterDetailsExist()) {
			this.characterDetails.on(characterDetailsEvents.DETAILS_CONFIRMED, onConfirmedCb);
			this.pageCharacterDetailsView.requestCharacterDetails();
		} else {
			// Otherwise callback straight away
			onConfirmedCb();
		}
	}

	// Builds UI Components
	setupUI () {
		if (!this.isSetup) {
			// Ensure our HTML DOM content is built
			this.pageView.buildView();

			this.pageCharacterDetailsView.buildView();
			this.pageChatView.buildView();
		}

	}

	handlePlayerLoginError (data) {
		if (ValidationHandler.checkDataAttributes(data, 'playerExists')) {
			this.pageChatView.updateMessageLog(LOGIN_FAILURE_MESSAGE_PWD, 'server');
		} else {
			this.pageChatView.updateMessageLog(LOGIN_FAILURE_MESSAGE_PLAYER, 'server');
		}
	}

	handleCharacterUpdateResponse (data) {
		if (CharacterDetails.isValidCharacterUpdateData(data)) {
			if (data['success'] === true) {
				
				let charData = data['char-data'];
				this.saveCharacterData(charData);

				Session.updateClientSessionData(data);
				this.pageCharacterDetailsView.updateStatsInfoLog(CHARACTER_UPDATE_SUCCESS_MESSAGE, 'server');
			} else { 
				this.pageCharacterDetailsView.updateStatsInfoLog(CHARACTER_UPDATE_FAILURE_MESSAGE, 'server');
			}
			
		} else {
			throw new RangeError(INVALID_JSON_CHARACTER_UPDATE);
		}
	}

	/**
	 * External setter for char stats from the server
	 * @param characterData
	 * @returns {boolean}
	 */
	saveCharacterData (characterData) {
		if (CharacterDetails.isValidCharacterData(characterData)) {
			this.pageCharacterDetailsView.setStatsFromJsonResponse(characterData);
			return true;
		} else {
			throw new RangeError(INVALID_JSON_CHARACTER_DATA);
			return false;
		}
	}

	/**
	 * Submit character details to the server
	 */
	sendCharDetails () {
		let attribs = this.pageCharacterDetailsView.getStats();
		this.SOCKET_HANDLER.sendCharacterDetails(attribs);
		this.pageCharacterDetailsView.updateStatsInfoLog('Character details submitted (unsaved).', 'client');
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
		this.SOCKET_HANDLER.sendNewChatMessage(this.pageChatView.getMessageInput());
		this.pageChatView.clearMessageInputField();
	}

	submitPassword () {
		var username = Session.getSessionInfoJSON().username;
		var passwordInput = this.pageChatView.getPasswordInput();

		if (username !== null && passwordInput !== '') {
			this.SOCKET_HANDLER.sendAuthentication(username, passwordInput);
			this.pageChatView.endPasswordSubmission();
			//	Set the send button behavior back to normal (isText)
			this.pageView.bindMessageButton(this.messageFieldKeyupTrigger);
			
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

		this.pageView.bindMessageButton(this.passwordFieldKeyupTrigger()); //	Set the send message behaviour to password sending
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

	bindStageClick (callback) {
		//this.pageView.bindStageClick(enabled, this.pixiController.stageClicked);
		this.pageView.bindStageClick(callback);
	}
	
	unbindStageClick () {
		//this.pageView.bindStageClick(enabled, this.pixiController.stageClicked);
		this.pageView.bindStageClick();
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
			//this.bindStageClick(true); //	Activate movement click input
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
