import $ from 'libs/jquery-3.1.1.js';

// DOM view for the chat
class PageChatView {
	static updateInputField (character) {
		var inputField;
		inputField = $('#message-input');
		if (inputField.val.length === 0) {
			return inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
		} else {
			return $('#message-input.user-input').append(character.data);
		}
	};

	static getMessageInput () {
		return $('#message-input').val();
	}

	static getPasswordInput () {
		return $('#password-input').val();
	}

	static clearMessageLog () {
		$('#message-log').val('');
	}

	static setMessageLog (text) {
		return $('#message-log').val(text);
	};

	static endPasswordSubmission () {
		let passwordField = $('#password-input');
		passwordField.val('');

		//	Hide the field to show the normal input box
		passwordField.hide();
		$('#message-log').val('');

		//	Set the send button behavior back to normal (isText)
		PageChatView.bindMessageButton(true);
	}

	//	Updates the input field using the message and username strings
	static updateMessageLog (msg, username) {
		var logVal;
		logVal = $('#message-log').val();

		if (username != null && username !== undefined) msg = '[' + username + '] ' + msg; //	Add a user tag to the message

		$('#message-log').val(logVal + msg + '\n');
	};

	static clearMessageInputField () {
		return $('#message-input').val('');
	};

	static showPasswordInput () {
		$('#password-input').show();
	}

	static hidePasswordInput () {
		$('#password-input').hide();
	}

	//	Binds 'Enter' to send message behavior
	static bindEnterKeyUp (method) {
		//	grab the fields
		var messageField = $('#message-input');
		var passwordField = $('#password-input');
		messageField.unbind('keyup'); //	Clear previous bindings first
		passwordField.unbind('keyup');

		messageField.on('keyup', function (evnt) {});
		passwordField.on('keyup', method);
	}

	//	Switches the 'Send' message behavior from message to password sending
	static bindMessageButton (keyUpMethod) {
		var thisButton = $('#send-message-button');
		thisButton.unbind('click');
		PageChatView.bindEnterKeyUp(keyUpMethod); //	Bind the enter key too

		thisButton.click(keyUpMethod);
	}
}

export { PageChatView };
