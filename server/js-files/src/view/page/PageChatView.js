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

	constructor (pageModel) {
		super();

		if (pageModel.doc !== undefined) {
			this.doc = pageModel.doc;
		} else {
			throw new RangeError("Bad constructor arguments: " + JSON.stringify(arguments));
		}
	}

	// Creates the HTML for this view if needed
	buildView () {
		var messageWindowJquery = jquery('#'+_MESSAGE_WINDOW_ID, this.doc);
		var messageWindowExists = messageWindowJquery.length > 0;
		
		if (!messageWindowExists) {
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
		
		//console.log('Built chat view DOM element:');
		//console.log(jquery('#'+_MESSAGE_WINDOW_ID, this.doc)[0]);
	}	
	
	updateInputField (character) {
		var inputField;
		inputField = jquery('#'+_MESSAGE_INPUT_ID, this.doc);
		if (inputField.val.length === 0) {
			return inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
		} else {
			return jquery('#'+_MESSAGE_INPUT_ID+'.user-input', this.doc).append(character.data);
		}
	};
	
	// Return a single matching DOM element
	getMessageInputField () {
		return jquery('#'+_MESSAGE_INPUT_ID, this.doc)[0];
	}

	getMessageInput () {
		return jquery('#'+_MESSAGE_INPUT_ID, this.doc).val();
	}

	// Return a single matching DOM element
	getPasswordInputFieldJquery () {
		return jquery('#'+_PWD_INPUT_ID, this.doc);
	}
	
	// Return a single matching DOM element
	getPasswordInputField () {
		return this.getPasswordInputFieldJquery()[0];
	}

	getPasswordInput () {
		return jquery('#'+_PWD_INPUT_ID, this.doc).val();
	}
	
	getMessageLogValue () {
		return jquery('#'+_MESSAGE_LOG_ID, this.doc).val();
	};

	clearMessageLog () {
		jquery('#'+_MESSAGE_LOG_ID, this.doc).val('');
	}

	setMessageLog (text) {
		return jquery('#'+_MESSAGE_LOG_ID, this.doc).val(text);
	};

	endPasswordSubmission () {
		let passwordField = jquery('#'+_PWD_INPUT_ID, this.doc);
		passwordField.val('');

		//	Hide the field to show the normal input box
		passwordField.hide();
		jquery('#'+_MESSAGE_LOG_ID, this.doc).val('');
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
	updateMessageLog (msg, username) {
		var logVal;
		logVal = jquery('#'+_MESSAGE_LOG_ID, this.doc).val();

		if (username != null && username !== undefined) msg = this.getContextTagString(username) + msg; //	Add a user tag to the message

		jquery('#'+_MESSAGE_LOG_ID, this.doc).val(logVal + msg + '\n');
	};

	clearMessageInputField () {
		return jquery('#'+_MESSAGE_INPUT_ID, this.doc).val('');
	};

	showPasswordInput () {
		var mypwdinput = jquery('#'+_PWD_INPUT_ID, this.doc);
		mypwdinput.show();
	}

	hidePasswordInput () {
		jquery('#'+_PWD_INPUT_ID, this.doc).hide();
	}

	//	Binds 'Enter' to send message behavior
	bindEnterKeyUp (method) {
		//	grab the fields
		var messageField = jquery('#'+_MESSAGE_INPUT_ID, this.doc);
		var passwordField = jquery('#'+_PWD_INPUT_ID, this.doc);
		messageField.unbind('keyup'); //	Clear previous bindings first
		passwordField.unbind('keyup');
		
		// blank func?
		//messageField.on('keyup', function (evnt) {});
		messageField.on('keyup', method);
		passwordField.on('keyup', method);
	}
	
	//	Switches the 'Send' message behavior from message to password sending
	bindMessageButton (keyUpMethod) {
		var thisButton = jquery('#'+_SEND_MESSAGE_BUTTON_ID, this.doc);
		thisButton.unbind('click');
		this.bindEnterKeyUp(keyUpMethod); //	Bind the enter key too

		thisButton.click(keyUpMethod);
	}
}
