var socket = io.connect();

function updateInputField (msg) {
	console.log("Received: "+msg.data);
	$('#main-window').append('<p class=\'user-message\'>'+msg.data+'</p>');
}

function onKeydown (e) {
	
}

//Socket custom event trigger for message response, passing in our function for a callback
socket.on('chat-message-response', updateInputField);



