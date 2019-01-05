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
	
	// Creates the HTML for this view if needed
	static buildView () {
		var messageWindowJquery = $('#'+_MESSAGE_WINDOW_ID);
		var messageWindowExists = messageWindowJquery.length > 0;
		
		if (!messageWindowExists) {
			// Parent div
			var messageWindow = document.createElement('div');
			messageWindow.setAttribute('id', _MESSAGE_WINDOW_ID);
			
			var messageLog = document.createElement('textarea');
			messageLog.setAttribute('id', _MESSAGE_LOG_ID);
			// read-only message log
			messageLog.setAttribute('disabled', true);
						
			var messageInput = document.createElement('input');
			messageInput.setAttribute('id', _MESSAGE_INPUT_ID);
			messageInput.setAttribute('type', 'text');
			
			var pwdInput = document.createElement('input');
			pwdInput.setAttribute('id', _PWD_INPUT_ID);
			pwdInput.setAttribute('type', 'password');

			var submitButton = document.createElement('input');
			submitButton.setAttribute('type', 'submit');
			submitButton.setAttribute('id', _SEND_MESSAGE_BUTTON_ID);
			submitButton.setAttribute('value', 'Send');

			messageWindow.append(messageLog);
			messageWindow.append(messageInput);
			messageWindow.append(pwdInput);
			messageWindow.append(submitButton);
			
			PageView.getMainWindowJquery().append(messageWindow);
		}
		
		//console.log('Built chat view DOM element:');
		//console.log($('#'+_MESSAGE_WINDOW_ID)[0]);
	}	
	
	static updateInputField (character) {
		var inputField;
		inputField = $('#'+_MESSAGE_INPUT_ID);
		if (inputField.val.length === 0) {
			return inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
		} else {
			return $('#'+_MESSAGE_INPUT_ID+'.user-input').append(character.data);
		}
	};
	
	// Return a single matching DOM element
	static getMessageInputField () {
		return $('#'+_MESSAGE_INPUT_ID)[0];
	}

	static getMessageInput () {
		return $('#'+_MESSAGE_INPUT_ID).val();
	}
	
	// Return a single matching DOM element
	static getPasswordInputField () {
		return $('#'+_PWD_INPUT_ID)[0];
	}

	static getPasswordInput () {
		return $('#'+_PWD_INPUT_ID).val();
	}
	
	static getMessageLogValue () {
		return $('#'+_MESSAGE_LOG_ID).val();
	};

	static clearMessageLog () {
		$('#'+_MESSAGE_LOG_ID).val('');
	}

	static setMessageLog (text) {
		return $('#'+_MESSAGE_LOG_ID).val(text);
	};

	static endPasswordSubmission () {
		let passwordField = $('#'+_PWD_INPUT_ID);
		passwordField.val('');

		//	Hide the field to show the normal input box
		passwordField.hide();
		$('#'+_MESSAGE_LOG_ID).val('');

		//	Set the send button behavior back to normal (isText)
		PageChatView.bindMessageButton(true);
	}
	
	// Tag to show message context
	static getContextTagString(text) {
		if (text != null && text !== undefined && text.length >= 1) { 
			return '[' + text + '] ';
		} else {
			// Otherwise just return an empty string
			return '';
		}
	}

	//	Updates the input field using the message and username strings
	static updateMessageLog (msg, username) {
		var logVal;
		logVal = $('#'+_MESSAGE_LOG_ID).val();

		if (username != null && username !== undefined) msg = PageChatView.getContextTagString(username) + msg; //	Add a user tag to the message

		$('#'+_MESSAGE_LOG_ID).val(logVal + msg + '\n');
	};

	static clearMessageInputField () {
		return $('#'+_MESSAGE_INPUT_ID).val('');
	};

	static showPasswordInput () {
		$('#'+_PWD_INPUT_ID).show();
	}

	static hidePasswordInput () {
		$('#'+_PWD_INPUT_ID).hide();
	}

	//	Binds 'Enter' to send message behavior
	static bindEnterKeyUp (method) {
		//	grab the fields
		var messageField = $('#'+_MESSAGE_INPUT_ID);
		var passwordField = $('#'+_PWD_INPUT_ID);
		messageField.unbind('keyup'); //	Clear previous bindings first
		passwordField.unbind('keyup');
		
		// blank func?
		//messageField.on('keyup', function (evnt) {});
		messageField.on('keyup', method);
		passwordField.on('keyup', method);
	}

	//	Switches the 'Send' message behavior from message to password sending
	static bindMessageButton (keyUpMethod) {
		var thisButton = $('#'+_SEND_MESSAGE_BUTTON_ID);
		thisButton.unbind('click');
		PageChatView.bindEnterKeyUp(keyUpMethod); //	Bind the enter key too

		thisButton.click(keyUpMethod);
	}
}
