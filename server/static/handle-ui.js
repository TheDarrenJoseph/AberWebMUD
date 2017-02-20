function updateInputField (socket, character) {
	//console.log("Received: "+character.data);
	
	var inputField = $('#message-input');
	
	//Check if input is empty
	if (inputField.val.length == 0) {
			//Create a paragraph encapsulating the input
			inputField.append('<p class=\'user-input\'>'+character.data+'</p>');
	} else {
			//Append to our input <p> tag
			$('#message-input .user-input').append(character.data)
	}
	

}

function updateMessageLog (msg) {
	//console.log("Received: "+msg.data);
	
	var previousLog = $('#message-log').val();
	
	//$('#main-window').append('<p class=\'user-message\'>'+msg.data+'</p>');
	$('#message-log').val(previousLog+msg.data);
}


function sendMessage(socket) {
	var userInput = $('#message-input').val();
	//console.log('message sent!: '+userInput);
	
	socket.emit('new-chat-message', {data: userInput});
	
}

function setupChat() {
	//var socket = io(url)
var socket = io.connect();

//Socket custom event trigger for message response, passing in our function for a callback
socket.on('chat-message-response', updateMessageLog);

//Using Jquery .click 
$('#send-message-button').click(sendMessage(socket));
}


//wait until our document is ready to use our functions
$(document).ready(setupChat);


