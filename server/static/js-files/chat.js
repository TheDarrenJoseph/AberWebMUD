function updateInputField (character) {
    var inputField;
    inputField = $('#message-input');
    if (inputField.val.length === 0) {
      return inputField.append('<p class=\'user-input\'>' + character.data + '</p>');
    } else {
      return $('#message-input .user-input').append(character.data);
    }
};

function setMessageLog (text) {
    return $('#message-log').val(text);
};

function updateMessageLog (msg) {
    var logVal;
    console.log("Received: " + msg['messageData']);
    logVal = $('#message-log').val();



    if (logVal != '') {
      //Add a newline before the message
      $('#message-log').val(logVal + '\n' +msg['messageData'] + '\n');
    } else {
      //First message line, no need for a newline prior
      $('#message-log').val(logVal + msg['messageData'] + '\n');
    }


};

function clearMessageInputField () {
    return $('#message-input').val('');
};
