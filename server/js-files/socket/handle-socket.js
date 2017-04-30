var socket = null;

function isSocketConnected () {
  return socket.connected;
}

function sendCharacterDetails() {
  var attrValuesJSON = getStats();
  var sessionJson = getSessionInfoJSON();

  console.log('STATS: '+attrValuesJSON);
  console.log('SESSION JSON: '+sessionJson);

  if (attrValuesJSON != null && sessionJson != null) {
    socket.emit('character-details', {'data': attrValuesJSON, 'sessionJson': sessionJson});

    console.log('Character details sent for saving..');
    updateStatsInfoLog('Character details submitted (unsaved).', 'client');
  }
}

function sendNewChatMessage() {
  var userInput = $('#message-input').val();
	//console.log('message sent!: \''+userInput+'\'');
  sessionJson = getSessionInfoJSON();

  //console.log(sessionJson)

  if (userInput !== '') {
	   socket.emit('new-chat-message', {'data': userInput, 'sessionJson': sessionJson});
  }
}

//Tries to send movement input for the current user
function sendMovementCommand(x,y) {
  var sessionJson = getSessionInfoJSON();

  if (sessionJson.username != null && sessionJson.sessionId != null) {
    console.log({'moveX': x, 'moveY': y, 'sessionJson': sessionJson});
  	socket.emit('movement-command', {'moveX': x, 'moveY': y, 'sessionJson': sessionJson});
  } else {
    console.log('Session info missing for movement command.');
  }
}

//Send the user's password to the sever
function sendAuthentication(username, passwordFieldVal){
  clientSession.username = username;
  socket.emit('client-auth', {'username': username, 'password': passwordFieldVal});
}

function saveMapUpdate (mapData) {
  overworldMap = JSON.parse(mapData['data']);
  overworldMapSizeX = mapData['map-size-x'];
  overworldMapSizeY = mapData['map-size-y'];
  console.log('MAP DATA RECEIVED');
}

function handleSessionError () {
  console.log('Session Error!');
}

function handleMessageData(data) {
  var messageData = data['chat-data'];
  var username = data['username'];
  console.log("Received: " + data);
  updateMessageLog(messageData, username);
}

//Save our given session id for later, and display the welcome message
function linkConnection(data){
  if (clientSession.sessionId == null) {
    clientSession.sessionId = data['sessionId'];
    console.log('Handshaked with server, session ID given:' + clientSession.sessionId);
    setMessageLog(data['chat-data']);
  } else {
    console.log('Reconnected, using old SID');
  }
}

function connectSocket() {
  socket = io.connect();
  //socket = io.connect('https://localhost');
}

function setStatusUpdateCallbacks () {
    socket.on('connection-response', linkConnection);
    socket.on('movement-response', handleMovementResponse);
    socket.on('movement-update', handleMovementUpdate);
    socket.on('character-details-update', handleCharacterUpdateResponse);

    socket.on('map-data-response', saveMapUpdate);

    socket.on('request-password', requestUserPassword); //  Request for existing password
    socket.on('request-new-password', userDoesNotExist); //  Request for new password
}

function setupChat () {
	// Socket custom event trigger for message response, passing in our function for a callback
	socket.on('chat-message-response', handleMessageData);
  socket.on('login-success', handlePlayerLogin);
  socket.on('login-failure', handlePlayerLoginError);
  socket.on('session-error', handleSessionError);
}
