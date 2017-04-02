function updateInputField (character) {
    var inputField;
    inputField = $('#message-input');
    if (inputField.val.length === 0) {
      return inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
    } else {
      return $('#message-input.user-input').append(character.data);
    }
};

function setMessageLog (text) {
    return $('#message-log').val(text);
};

//Updates the input field using the message and username strings
function updateMessageLog (msg, username) {
    var logVal;
    logVal = $('#message-log').val();

    if (username != null && username != undefined) msg = '['+username+'] '+ msg; //Add a user tag to the message

    $('#message-log').val(logVal + msg + '\n');
};

function clearMessageInputField () {
    return $('#message-input').val('');
};
