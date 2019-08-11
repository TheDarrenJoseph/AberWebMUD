import jquery from 'jquery';
import { PageView } from 'src/view/page/PageView.js';
import { PageHtmlView } from 'src/view/page/PageHtmlView.js';

//import $ from 'libs/jquery.js';

export const _MESSAGE_WINDOW_ID = 'message-window';
export const _MESSAGE_INPUT_ID = 'message-input';
export const _MESSAGE_LOG_ID = 'message-log';
export const _SEND_MESSAGE_BUTTON_ID = 'send-message-button';

export const EVENTS = { SEND_MESSAGE : 'send_message' };
const ENTER_KEY_EVENT_CODE = 13;

// DOM view for the chat
export default class PageChatView extends PageHtmlView {

	//	<div id='message-window'>
	//		<textarea id='message-log' disabled='true'></textarea>
	//		<input type='text' id='message-input'>
	//		<input type='password' id='password-input'>
	//		<input type='submit' id='send-message-button' value='Send'>
	//	</div>

	constructor (pageView) {
		if (pageView == undefined) throw new RangeError('pageView expected')
		super(pageView.pageModel.doc, EVENTS,
		{
			[_MESSAGE_WINDOW_ID]: '#'+_MESSAGE_WINDOW_ID,
			[_MESSAGE_INPUT_ID]: '#' + _MESSAGE_INPUT_ID,
			//[_PWD_INPUT_ID]: '#' + _PWD_INPUT_ID,
			[_SEND_MESSAGE_BUTTON_ID]: '#' + _SEND_MESSAGE_BUTTON_ID
		});
		this.pageView = pageView;
	}

	/**
	 * Simply constructs a message window element
	 * @returns HTMLElement for messageWindow
	 */
	buildMessageWindow() {
		// Parent div
		var messageWindow = this.doc.createElement('div');
		messageWindow.setAttribute('id', _MESSAGE_WINDOW_ID);

		var messageLog = this.doc.createElement('textarea');
		messageLog.setAttribute('id', _MESSAGE_LOG_ID);
		// read-only message log
		messageLog.setAttribute('disabled', true);

		var messageInput = this.doc.createElement('input');
		messageInput.setAttribute('id', _MESSAGE_INPUT_ID);
		messageInput.setAttribute('type', 'text');

		//var pwdInput = this.doc.createElement('input');
		//pwdInput.setAttribute('id', _PWD_INPUT_ID);
		//pwdInput.setAttribute('type', 'password');

		var submitButton = this.doc.createElement('input');
		submitButton.setAttribute('type', 'submit');
		submitButton.setAttribute('id', _SEND_MESSAGE_BUTTON_ID);
		submitButton.setAttribute('value', 'Send');

		messageWindow.append(messageLog);
		messageWindow.append(messageInput);
		//messageWindow.append(pwdInput);
		messageWindow.append(submitButton);

		return messageWindow;
	}

	/**
	 * Idempotently generates the message window and adds it to the document
	 */
	generateMessageWindow(){
		var messageWindowJquery = this.getMessageWindowJquery();
		var messageWindowExists = messageWindowJquery.length > 0;

		if (!messageWindowExists) {
			let messageWindow = this.buildMessageWindow();
			this.pageView.appendToGameWindow(messageWindow);
			return messageWindow;

			// Ensure password input only appears when required
			// this.hidePasswordInput();
		} else {
			return this.getMessageWindow();
		}
	}


	// Creates the HTML for this view if needed
	buildView () {
		let messageWindow = this.generateMessageWindow();
		return messageWindow;
	}	
	
	updateInputField (character) {
		var inputFieldJquery = this.getMessageInputFieldJquery();
		if (inputFieldJquery.val.length === 0) {
			return inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
		} else {
			return jquery('#'+_MESSAGE_INPUT_ID+'.user-input', this.doc).append(character.data);
		}
	};


	getMessageWindowJquery() {
		return jquery('#'+_MESSAGE_WINDOW_ID, this.doc);
	}

	getMessageWindow () {
		let elements = this.getMessageWindowJquery();
		if (elements.length >= 1) {
			return elements.get(0);
		} else {
			throw new Error("Message window not present.");
		}
	}

	getSendMessageButtonJquery() {
		return jquery('#'+_SEND_MESSAGE_BUTTON_ID, this.doc);
	}

	getSendMessageButton() {
		let elements = this.getSendMessageButtonJquery();
		if (elements.length >= 1) {
			return elements.get(0);
		} else {
			throw new Error("Message input field not present.");
		}
	}

	getMessageInputFieldJquery() {
		return jquery('#'+_MESSAGE_INPUT_ID, this.doc)
	}

	// Return a single matching DOM element
	getMessageInputField () {
		let elements = this.getMessageInputFieldJquery();
		if (elements.length >= 1) {
			return elements.get(0);
		} else {
			throw new Error("Message input field not present.");
		}
	}

	getMessageInput () {
		return this.getMessageInputFieldJquery().val();
	}

	// Return a single matching DOM element
	//getPasswordInputFieldJquery () {
	//	return jquery('#'+_PWD_INPUT_ID, this.doc);
	//}

	//clearPasswordInputField() {
	//	this.getPasswordInputFieldJquery().val('');
	//}
	
	// Return a single matching DOM element
	//getPasswordInputField () {
	//	return this.getPasswordInputFieldJquery()[0];
	//}

	getPasswordInput () {
		return this.getPasswordInputFieldJquery().val();
	}

	getMessageLogJquery () {
		return jquery('#'+_MESSAGE_LOG_ID, this.doc);
	}

	getMessageLogValue () {
		return this.getMessageLogJquery().val();
	};

	clearMessageLog () {
		this.getMessageLogJquery().val('');
	}

	setMessageLog (text) {
		return this.getMessageLogJquery().val(text);
	};

	endPasswordSubmission () {
		this.clearPasswordInputField();
		var passwordField = this.getPasswordInputFieldJquery();
		//	Hide the field to show the normal input box
		passwordField.hide();
		this.clearMessageLog();
	}
	
	// Tag to show message context
	getContextTagString(text) {
		if (text != null && text !== undefined && text.length >= 1) { 
			return '[' + text + '] ';
		} else {
			// Otherwise just return an empty string
			return '';
		}
	}

	//	Updates the input field using the message and username strings

	/**
	 * Appends a message to the message log
	 * @param msg
	 * @param username
	 */
	updateMessageLog (msg, username) {
		var logVal = this.getMessageLogValue();
		if (username != null && username !== undefined) msg = this.getContextTagString(username) + msg; //	Add a user tag to the message
		let logMsg = logVal + msg + '\n';
		this.setMessageLog(logMsg);
	};

	clearMessageInputField () {
		this.getMessageInputFieldJquery().val('');
	};

	//showPasswordInput () {
		// Make sure the parent window is showing
		//this.showElement(_MESSAGE_WINDOW_ID);
		//this.showElement(_PWD_INPUT_ID);
  //}

	//hidePasswordInput () {
	//	this.hideElement(_PWD_INPUT_ID);
	//}


	showMessageWindow() {
		this.showElement(_MESSAGE_WINDOW_ID);
	}

	hideMessageWindow() {
		this.hideElement(_MESSAGE_WINDOW_ID);
	}

	toggleConsoleVisibility () {
		this.toggleWindow(_MESSAGE_WINDOW_ID);
	}


	/**
	 * Setup emitting of events for this view
	 */
	setupEmitting () {
		this.getSendMessageButton().click(() => {
			console.log('Send button clicked')
			this.emit(EVENTS.SEND_MESSAGE)
		});
		this.bindEnterKeyUp(() => {
			this.emit(EVENTS.SEND_MESSAGE)
		});
	}

	/**
	 * Binds to any events this view needs to react to w/o emitting
	 */
	bindEvents () {
		//Bind to any events we need to react to
	}

	//	Binds 'Enter' to send message behavior
	bindEnterKeyUp (callback) {
		//	grab the fields
		var messageField = this.getMessageInputFieldJquery();
		var passwordField = this.getPasswordInputFieldJquery();
		messageField.unbind('keyup'); //	Clear previous bindings first
		passwordField.unbind('keyup');
		
		// blank func?
		//messageField.on('keyup', function (evnt) {});
		messageField.on('keyup', (eventObject) => {
			//	Enter key check
			if (eventObject.keyCode === ENTER_KEY_EVENT_CODE) {
				callback();
			}
		});
		passwordField.on('keyup', (eventObject) => {
			//	Enter key check
			if (eventObject.keyCode === ENTER_KEY_EVENT_CODE) {
				callback();
			}
		});
	}

	// Emit instead
	//bindMessageButton (keyUpMethod) {
	//	var thisButton = this.getSendMessageButtonJquery();
	//	thisButton.unbind('click');
	//	this.bindEnterKeyUp(keyUpMethod); //	Bind the enter key too
	//	thisButton.click(keyUpMethod);
	//}
}

export { PageChatView };