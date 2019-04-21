import jquery from 'jquery';
import { PageView } from 'src/view/page/PageView.js';
import { EventMapping } from 'src/helper/EventMapping.js';

//import $ from 'libs/jquery.js';

const _MESSAGE_WINDOW_ID = 'message-window';
const _MESSAGE_INPUT_ID = 'message-input';
const _PWD_INPUT_ID = 'password-input';
const _MESSAGE_LOG_ID = 'message-log';
const _SEND_MESSAGE_BUTTON_ID = 'send-message-button';

// DOM view for the chat
export default class PageChatView extends EventMapping {

	//	<div id='message-window'>
	//		<textarea id='message-log' disabled='true'></textarea>
	//		<input type='text' id='message-input'>
	//		<input type='password' id='password-input'>
	//		<input type='submit' id='send-message-button' value='Send'>
	//	</div>

	constructor (pageView) {
		super();

		this.pageView = pageView;

		// Try to extract the Document context
		let doc = pageView.pageModel.doc;
		if (doc !== undefined) {
			this.doc = doc;
		} else {
			throw new RangeError("Bad constructor arguments: " + JSON.stringify(arguments));
		}
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

		var pwdInput = this.doc.createElement('input');
		pwdInput.setAttribute('id', _PWD_INPUT_ID);
		pwdInput.setAttribute('type', 'password');

		var submitButton = this.doc.createElement('input');
		submitButton.setAttribute('type', 'submit');
		submitButton.setAttribute('id', _SEND_MESSAGE_BUTTON_ID);
		submitButton.setAttribute('value', 'Send');

		messageWindow.append(messageLog);
		messageWindow.append(messageInput);
		messageWindow.append(pwdInput);
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
			this.pageView.appendToMainWindow(messageWindow);
		}
	}


	// Creates the HTML for this view if needed
	buildView () {
		this.generateMessageWindow();
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
	getPasswordInputFieldJquery () {
		return jquery('#'+_PWD_INPUT_ID, this.doc);
	}

	clearPasswordInputField() {
		this.getPasswordInputFieldJquery().val('');
	}
	
	// Return a single matching DOM element
	getPasswordInputField () {
		return this.getPasswordInputFieldJquery()[0];
	}

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

	showPasswordInput () {
		this.getPasswordInputFieldJquery().show();
	}

	hidePasswordInput () {
		this.getPasswordInputFieldJquery().hide();
	}

	//	Binds 'Enter' to send message behavior
	bindEnterKeyUp (method) {
		//	grab the fields
		var messageField = this.getMessageInputFieldJquery();
		var passwordField = this.getPasswordInputFieldJquery();
		messageField.unbind('keyup'); //	Clear previous bindings first
		passwordField.unbind('keyup');
		
		// blank func?
		//messageField.on('keyup', function (evnt) {});
		messageField.on('keyup', method);
		passwordField.on('keyup', method);
	}
	
	//	Switches the 'Send' message behavior from message to password sending
	bindMessageButton (keyUpMethod) {
		var thisButton = this.getSendMessageButtonJquery();
		thisButton.unbind('click');
		this.bindEnterKeyUp(keyUpMethod); //	Bind the enter key too
		thisButton.click(keyUpMethod);
	}
}
