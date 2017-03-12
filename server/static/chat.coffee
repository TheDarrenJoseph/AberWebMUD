

updateInputField = (character) ->
	# console.log("Received: "+character.data);
	inputField = $('#message-input');

	# Check if input is empty
	if (inputField.val.length == 0)
		# Create a paragraph encapsulating the input
		inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
	else
		# Append to our input <p> tag
		$('#message-input .user-input').append(character.data);


setMessageLog = (text) ->
	$('#message-log').val(text);


updateMessageLog = (msg) ->
	console.log("Received: "+msg['messageData']);
	logVal = $('#message-log').val();

	#$('#message-log').append('<p class=\'user-message\'>'+msg.data+'</p>');
	#if (logVal == null) {
	$('#message-log').val(logVal + msg['messageData']+'\n');
	#}


clearMessageInputField = () ->
	$('#message-input').val('');
