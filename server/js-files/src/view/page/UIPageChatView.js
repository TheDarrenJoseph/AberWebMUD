import $ from 'libs/jquery-3.1.1.js';

// DOM view for the chat
class UIPageChatView {
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
		var userInput = $('#message-input').val();
		return userInput;
	}

	static clearMessageLog () {
		$('#message-log').val('');
	}

	static setMessageLog (text) {
		return $('#message-log').val(text);
	};

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
}

export { UIPageChatView };
