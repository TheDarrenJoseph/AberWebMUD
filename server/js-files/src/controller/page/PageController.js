import { EVENTS as pageChatEvents, PageChatView} from 'src/view/page/PageChatView.js';
import { EVENTS as pageCharacterDetailsViewEvents, PageCharacterDetailsView} from 'src/view/page/PageCharacterDetailsView.js';

import { Page } from 'src/model/page/Page.js';
import { EVENTS as characterDetailsEvents, CharacterDetails } from 'src/model/page/CharacterDetails.js';
import { PageView } from 'src/view/page/PageView.js';

//	Hooking up to a bunch of other controllers for now
import { Session } from 'src/model/Session.js';

//	We're going to call out to the SocketHandler from here for now
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';

import ValidationHandler from 'src/handler/ValidationHandler.js';


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

		this.isSetup = false;
		this.uiEnabled = false;
		// This is for
		this.charDetailsConfirmed = false;

		this.SOCKET_HANDLER = SocketHandler.getInstance();

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

	getPageView() {
		return this.pageView;
	}

	getPageCharacterDetailsView() {
		return this.pageCharacterDetailsView;
	}

	getPageChatView () {
		return this.pageChatView;s
	}

	/**
	 * Bind to chat view events
	 */
	bindPageChatView () {
		this.pageChatView.on(pageChatEvents.SEND_MESSAGE, () => { this.submitChatMessage() });
	}

	/**
	 * Bind to character details view events
	 */
	bindPageCharacterDetailsView () {
		// Bind to events this view may emit
		this.pageCharacterDetailsView.on(pageCharacterDetailsViewEvents.SUBMIT_STATS, (data) => { this.sendCharDetails(data) });

		// Setup emitting for the above binding(s)
		this.pageCharacterDetailsView.bindEvents();
	}

	/**
	 * Binds all views vents for each view
	 */
	bindEvents () {
		this.bindPageChatView();
		this.bindPageCharacterDetailsView();
	}

	/**
	 * Setups up event emitting for each view
	 */
	setupEmitting () {
		this.pageChatView.setupEmitting();
		this.pageCharacterDetailsView.setupEmitting();
	}

	onceCharacterDetailsSet (onConfirmedCb) {
		// Single-shot mapping for setting of the details to something
		this.characterDetails.once(characterDetailsEvents.SET_DETAILS, () => {
			this.charDetailsConfirmed = true;
			onConfirmedCb();
		});
	}

	isCharacterDetailsConfirmed() {
		return this.charDetailsConfirmed;
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

	/**
	 * Checks the data for indicators of the failure type and updates the message log accordingly
	 * @param data
	 */
	handlePlayerLoginError (data) {
		let playerExistsAttrib = 'playerExists';
		if (ValidationHandler.checkDataAttributes(data, [playerExistsAttrib]) && data[playerExistsAttrib] === true) {
			this.pageChatView.updateMessageLog(LOGIN_FAILURE_MESSAGE_PWD, 'server');
		} else {
			this.pageChatView.updateMessageLog(LOGIN_FAILURE_MESSAGE_PLAYER, 'server');
		}
	}

	/**
	 * Parses the charcter update response
	 * Extracts and sets the char details on success
	 * Also displays a message relevant to this
	 * @param data JSON character update data
	 */
	handleCharacterUpdateResponse (data) {
		if (CharacterDetails.isValidCharacterUpdateData(data)) {
			let success = data['success'];

			if (success === true) {
				// Try to save the returned character details
				let charData = data['char-data'];
				if (this.saveCharacterData(charData)) {
					Session.ActiveSession.updateClientSessionData(data);
					this.pageCharacterDetailsView.updateStatsInfoLog(CHARACTER_UPDATE_SUCCESS_MESSAGE, 'server');
				}
			} else {
				// Set a failure message and re-prompt the player
				this.pageCharacterDetailsView.updateStatsInfoLog(CHARACTER_UPDATE_FAILURE_MESSAGE, 'server');
				this.pageCharacterDetailsView.requestCharacterDetails();
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
			// Set the underlying view model so the view reacts
			this.pageCharacterDetailsView.characterDetails.setCharacterDetails(characterData);
			return true;
		} else {
			throw new RangeError(INVALID_JSON_CHARACTER_DATA);
			return false;
		}
	}

	/**
	 * Submit character details to the server
	 */
	sendCharDetails (data) {
		this.SOCKET_HANDLER.sendCharacterDetails(data);
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
		var username = Session.ActiveSession.getSessionInfoJSON().username;
		var passwordInput = this.pageChatView.getPasswordInput();

		if (username !== null && passwordInput !== '') {
			this.SOCKET_HANDLER.sendAuthentication(username, passwordInput);
			this.pageChatView.endPasswordSubmission();
			//	Set the send button behavior back to normal (isText)
			this.pageChatView.on(pageChatEvents.SEND_MESSAGE, this.submitChatMessage);
			//this.pageChatView.bindMessageButton(this.messageFieldKeyupTrigger);
			
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

		this.pageChatView.on(pageChatEvents.SEND_MESSAGE, this.submitPassword);
		//this.pageChatView.bindMessageButton(this.passwordFieldKeyupTrigger); //	Set the send message behaviour to password sending
	}

	disableUI () {
		if (this.uiEnabled) {
			this.pageView.unbindStageClick();
			this.uiEnabled = false;
		}
	}
	
	// Idempotent UI Enabling
	enableUI () {
		if (!this.uiEnabled) {
			this.setupUI();
			this.uiEnabled = true;
			
			//	Hookup message sending and other controls
			this.bindEvents();
			this.setupEmitting();
		}
	}
	
	isUIEnabled () {
		return this.uiEnabled;
	}
}

export { PageController };
