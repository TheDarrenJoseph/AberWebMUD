var socket = io.connect();

function updateInputField (character) {
	// console.log("Received: "+character.data);
	var inputField = $('#message-input');

	// Check if input is empty
	if (inputField.val.length === 0) {
			// Create a paragraph encapsulating the input
		inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
	} else {
			// Append to our input <p> tag
		$('#message-input .user-input').append(character.data);
	}
}

function updateMessageLog (msg) {
	// console.log("Received: "+msg.data);
	var logVal = $('#message-log').val();

	//$('#message-log').append('<p class=\'user-message\'>'+msg.data+'</p>');
	//if (logVal == null) {
		$('#message-log').val(logVal + msg.data+'\n');
	//}
}

function sendMessage () {
	var userInput = $('#message-input').val();
	//console.log('message sent!: \''+userInput+'\'');
	socket.emit('new-chat-message', {data: userInput});
	$('#message-input').val('');
}

function setupChat () {
	// Socket custom event trigger for message response, passing in our function for a callback
	socket.on('chat-message-response', updateMessageLog);
}

$(document).ready(setupChat);
