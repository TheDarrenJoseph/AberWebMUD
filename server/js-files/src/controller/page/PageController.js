import { EVENTS as pageChatEvents, PageChatView, _MESSAGE_WINDOW_ID} from 'src/view/page/PageChatView.js';
import { EVENTS as pageCharacterDetailsViewEvents, PageCharacterDetailsView, _STATS_WINDOW_ID} from 'src/view/page/PageCharacterDetailsView.js';

import { Page } from 'src/model/page/Page.js';
import { EVENTS as characterDetailsEvents, CharacterDetails } from 'src/model/page/CharacterDetails.js';
import { PageView, _MAIN_WINDOW_ID, _GAME_WINDOW_ID } from 'src/view/page/PageView.js';
import  { _INVENTORY_WINDOW_ID } from 'src/view/page/PageInventoryView.js';

//	Hooking up to a bunch of other controllers for now
import { EVENTS as sessionEvents, Session } from 'src/model/Session.js';

//	We're going to call out to the SocketHandler from here for now
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';
import { FetchHandler } from 'src/handler/http/FetchHandler.js';

import ValidationHandler from 'src/handler/ValidationHandler.js';
import PageInventoryView from 'src/view/page/PageInventoryView.js';
import { EVENTS as pageLoginEvents, PageLoginView } from 'src/view/page/PageLoginView.js';

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
	constructor(doc, pageView, pageCharacterDetailsView, pageChatView, pageInventoryView, pageLoginView) {

		this.isSetup = false;
		this.uiEnabled = false;
		// This is for
		this.charDetailsConfirmed = false;

		this.SOCKET_HANDLER = SocketHandler.getInstance();

		this.characterDetails = new CharacterDetails();

		let docUrlParts = document.URL.split('/');
		let protocol = docUrlParts[0]+'//'
		let baseUrl = docUrlParts[2];
		console.info('PageController FetchHandler URL: ' + protocol + baseUrl)
		this.fetchHandler = new FetchHandler(protocol + baseUrl);

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

		if (pageInventoryView == undefined) {
			this.pageInventoryView = new PageInventoryView(this.doc);
		} else {
			this.pageInventoryView = pageInventoryView;
		}

		if (pageLoginView == undefined) {
			this.pageLoginView = new PageLoginView(this.doc)
		} else {
			this.pageLoginView = pageLoginView;
		}

	}

	getPageView() {
		return this.pageView;
	}

	getPageCharacterDetailsView() {
		return this.pageCharacterDetailsView;
	}

	getPageInventoryView() {
		return this.pageInventoryView;
	}

	getPageChatView () {
		return this.pageChatView;
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

	bindPageLoginView() {
		//this.pageChatView.on(pageChatEvents.SEND_MESSAGE, () => { this.submitPassword.apply(this, [username]) });
		this.pageLoginView.on(pageLoginEvents.SUBMIT_LOGIN, () => { this.submitPassword() })
	}

	/**
	 * Binds all views vents for each view
	 */
	bindEvents () {
		this.bindPageChatView();
		this.bindPageCharacterDetailsView();
		this.bindPageLoginView();
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

	extractAttributeClassOptions(jsonData) {
		let classOptions = [];
		let availableOptions = jsonData.options;

		for (let i=0; i < availableOptions.length; i++) {
			let availOpt = availableOptions[i];

			let thisOption = {
				id: availOpt.toLowerCase(),
				text: availOpt
			}
			classOptions.push(thisOption);
		}

		return classOptions;
	}

	handleAttributeClassOptions(jsonData) {
		let attributeClassOptions = this.extractAttributeClassOptions(jsonData)
		this.pageCharacterDetailsView.characterDetails.setCharacterClassOptions(attributeClassOptions);
	}

	// Builds UI Components
	setupUI () {
		if (!this.isSetup) {

			this.SOCKET_HANDLER.bind()

			// Ensure our HTML DOM content is built
			this.pageView.buildView();

			let pageChatWindow        = this.pageChatView.buildView();
			let charDetailsWindow = this.pageCharacterDetailsView.buildView();
			let pageInventoryWindow   = this.pageInventoryView.buildView();
			let pageLoginWindow       = this.pageLoginView.buildView();

			Session.ActiveSession.once(sessionEvents.ACTIVE_SESSION, () => {
				console.info('Active Session for Character Details View!')

				// Make a request for the character class options
				this.fetchAttributeClassOptions().then(jsonData => {
					let attributeClassOptions = this.extractAttributeClassOptions(jsonData)
					this.pageCharacterDetailsView.characterDetails.setCharacterClassOptions(attributeClassOptions);
					console.info('Character Details View class options set, building view!')
				}).catch(reason => { throw reason })
			})

			//TODO perform this step somewhere graceful to avoid passing the pageView into every view element
			this.pageView.appendToGameWindow(pageInventoryWindow);
			this.pageView.appendToGameWindow(pageLoginWindow);

			this.pageView.showElement(_MAIN_WINDOW_ID);
			this.pageView.showElement(_GAME_WINDOW_ID);

			this.pageCharacterDetailsView.hideStatsWindow();
			this.pageChatView.hideMessageWindow();
			//this.pageInventoryView.hideInventoryWindow();
			this.pageLoginView.hideLoginWindow();

			this.isSetup = true;
		}
	}


	fetchAttributeClassOptions() {
		let response = this.fetchHandler.get('/attributes-class-options');
		return response;
	}


	showLogin() {
		this.pageLoginView.showLoginWindow();
	}

	hideLogin() {
		this.pageChatView.hideMessageWindow();
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
				if (this.saveCharacterData(data)) {
					Session.ActiveSession.setClientSessionData(data);
					this.pageCharacterDetailsView.updateStatsInfoLog(CHARACTER_UPDATE_SUCCESS_MESSAGE, 'server');
				}
			} else {
				// Set a failure message and re-prompt the player
				this.pageCharacterDetailsView.updateStatsInfoLog(CHARACTER_UPDATE_FAILURE_MESSAGE, 'server');
				this.pageCharacterDetailsView.requestCharacterDetails();
			}
			
		} else {
			throw new RangeError(INVALID_JSON_CHARACTER_UPDATE + ' : ' + JSON.stringify(data));
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
		let success = responseJSON['success'];

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
		let username = this.pageLoginView.getUsername();
		let password = this.pageLoginView.getPassword();

		if (username !== null && password !== '') {
			this.SOCKET_HANDLER.sendAuthentication(username, password);
			this.pageLoginView.hideLoginWindow();
		} else {
			console.error('Invalid login details');
		}
	}

	//Triggered once a user sends a login message
	// Prompts for a user password
	// username - String username
	requestUserPassword (username, promptMessage) {

		try {
			// Store the username for later
			Session.ActiveSession.getPlayer().setUsername(username);
		} catch (rangeError) {
			this.pageChatView.setMessageLog(rangeError.message);
			return;
		}

		//this.pageChatView.on(pageChatEvents.SEND_MESSAGE, () => { this.submitPassword.apply(this, [username]) });

		//this.pageChatView.showPasswordInput();

		if (ValidationHandler.validString(promptMessage)) {
			this.pageChatView.setMessageLog(promptMessage);
		} else {
			throw new RangeError('Expected a properly formatted prompt message!');
		}

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
