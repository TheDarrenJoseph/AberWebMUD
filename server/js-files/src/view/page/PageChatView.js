import $ from 'libs/jquery.js';
import { PageView } from 'src/view/page/PageView.js';

const _MESSAGE_WINDOW_ID = 'message-window';
const _MESSAGE_INPUT_ID = 'message-input';
const _PWD_INPUT_ID = 'password-input';
const _MESSAGE_LOG_ID = 'message-log';
const _SEND_MESSAGE_BUTTON_ID = 'send-message-button';

// DOM view for the chat
export default class PageChatView {

	//	<div id='message-window'>
	//		<textarea id='message-log' disabled='true'></textarea>
	//		<input type='text' id='message-input'>
	//		<input type='password' id='password-input'>
	//		<input type='submit' id='send-message-button' value='Send'>
	//	</div>

	constructor (pageView) {
		this.pageView = pageView;
	}

	// Creates the HTML for this view if needed
	buildView () {
		var messageWindowJquery = $('#'+_MESSAGE_WINDOW_ID, this.pageView.DOCUMENT);
		var messageWindowExists = messageWindowJquery.length > 0;
		
		if (!messageWindowExists) {
			// Parent div
			var messageWindow = this.pageView.DOCUMENT.createElement('div');
			messageWindow.setAttribute('id', _MESSAGE_WINDOW_ID);
			
			var messageLog = this.pageView.DOCUMENT.createElement('textarea');
			messageLog.setAttribute('id', _MESSAGE_LOG_ID);
			// read-only message log
			messageLog.setAttribute('disabled', true);
						
			var messageInput = this.pageView.DOCUMENT.createElement('input');
			messageInput.setAttribute('id', _MESSAGE_INPUT_ID);
			messageInput.setAttribute('type', 'text');
			
			var pwdInput = this.pageView.DOCUMENT.createElement('input');
			pwdInput.setAttribute('id', _PWD_INPUT_ID);
			pwdInput.setAttribute('type', 'password');

			var submitButton = this.pageView.DOCUMENT.createElement('input');
			submitButton.setAttribute('type', 'submit');
			submitButton.setAttribute('id', _SEND_MESSAGE_BUTTON_ID);
			submitButton.setAttribute('value', 'Send');

			messageWindow.append(messageLog);
			messageWindow.append(messageInput);
			messageWindow.append(pwdInput);
			messageWindow.append(submitButton);

			this.pageView.getMainWindowJquery().append(messageWindow);
		}
		
		//console.log('Built chat view DOM element:');
		//console.log($('#'+_MESSAGE_WINDOW_ID, this.pageView.DOCUMENT)[0]);
	}	
	
	updateInputField (character) {
		var inputField;
		inputField = $('#'+_MESSAGE_INPUT_ID, this.pageView.DOCUMENT);
		if (inputField.val.length === 0) {
			return inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
		} else {
			return $('#'+_MESSAGE_INPUT_ID+'.user-input', this.pageView.DOCUMENT).append(character.data);
		}
	};
	
	// Return a single matching DOM element
	getMessageInputField () {
		return $('#'+_MESSAGE_INPUT_ID, this.pageView.DOCUMENT)[0];
	}

	getMessageInput () {
		return $('#'+_MESSAGE_INPUT_ID, this.pageView.DOCUMENT).val();
	}

	// Return a single matching DOM element
	getPasswordInputFieldJquery () {
		return $('#'+_PWD_INPUT_ID, this.pageView.DOCUMENT);
	}
	
	// Return a single matching DOM element
	getPasswordInputField () {
		return this.getPasswordInputFieldJquery()[0];
	}

	getPasswordInput () {
		return $('#'+_PWD_INPUT_ID, this.pageView.DOCUMENT).val();
	}
	
	getMessageLogValue () {
		return $('#'+_MESSAGE_LOG_ID, this.pageView.DOCUMENT).val();
	};

	clearMessageLog () {
		$('#'+_MESSAGE_LOG_ID, this.pageView.DOCUMENT).val('');
	}

	setMessageLog (text) {
		return $('#'+_MESSAGE_LOG_ID, this.pageView.DOCUMENT).val(text);
	};

	endPasswordSubmission () {
		let passwordField = $('#'+_PWD_INPUT_ID, this.pageView.DOCUMENT);
		passwordField.val('');

		//	Hide the field to show the normal input box
		passwordField.hide();
		$('#'+_MESSAGE_LOG_ID, this.pageView.DOCUMENT).val('');
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
		logVal = $('#'+_MESSAGE_LOG_ID, this.pageView.DOCUMENT).val();

		if (username != null && username !== undefined) msg = this.getContextTagString(username) + msg; //	Add a user tag to the message

		$('#'+_MESSAGE_LOG_ID, this.pageView.DOCUMENT).val(logVal + msg + '\n');
	};

	clearMessageInputField () {
		return $('#'+_MESSAGE_INPUT_ID, this.pageView.DOCUMENT).val('');
	};

	showPasswordInput () {
		var mypwdinput = $('#'+_PWD_INPUT_ID, this.pageView.DOCUMENT);
		mypwdinput.show();
	}

	hidePasswordInput () {
		$('#'+_PWD_INPUT_ID, this.pageView.DOCUMENT).hide();
	}

	//	Binds 'Enter' to send message behavior
	bindEnterKeyUp (method) {
		//	grab the fields
		var messageField = $('#'+_MESSAGE_INPUT_ID, this.pageView.DOCUMENT);
		var passwordField = $('#'+_PWD_INPUT_ID, this.pageView.DOCUMENT);
		messageField.unbind('keyup'); //	Clear previous bindings first
		passwordField.unbind('keyup');
		
		// blank func?
		//messageField.on('keyup', function (evnt) {});
		messageField.on('keyup', method);
		passwordField.on('keyup', method);
	}
	
	//	Switches the 'Send' message behavior from message to password sending
	bindMessageButton (keyUpMethod) {
		var thisButton = $('#'+_SEND_MESSAGE_BUTTON_ID, this.pageView.DOCUMENT);
		thisButton.unbind('click');
		this.bindEnterKeyUp(keyUpMethod); //	Bind the enter key too

		thisButton.click(keyUpMethod);
	}
}
