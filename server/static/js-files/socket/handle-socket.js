var socket = null;

function isSocketConnected () {
  return socket.connected;
}

function sendCharacterDetails() {
  var attrValuesJSON = getStats();
  var sessionJson = getSessionInfoJSON();
  if (attrValuesJSON != null && sessionJson != null){
    socket.emit('character-details', {'data': attrValuesJSON, 'sessionJson': sessionJson});
    console.log('Character details sent for saving..');
    updateMessageLog('Character details submitted (unsaved).', 'client');
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

  if (username != null && sessionId != null) {
  	socket.emit('movement-command', {'moveX': x, 'moveY': y, 'sessionJson': sessionJson});
  }
}

//Send the user's password to the sever
function sendAuthentication(username, passwordFieldVal){
  clientSession.username = username;
  socket.emit('client-auth', {'username': username, 'password': passwordFieldVal});
}

//Save our given session id for later, and display the welcome message
function linkConnection(data){
  if (clientSession.sessionId == null) {
    clientSession.sessionId = data['sessionId'];
    console.log('Handshaked with server, session ID given:' + clientSession.sessionId);
    setMessageLog(data['messageData']);
  } else {
    console.log('Reconnected, using old SID');
  }
}

function connectSocket() {
  socket = io.connect();
  //socket = io.connect('https://localhost');
}

function setStatusUpdateCallbacks () {
    socket.on('movement-response', handleMovementResponse);
    socket.on('movement-update', handleMovementUpdate);
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
  var messageData = data['data'];
  var username = data['sessionJson']['username'];
  console.log("Received: " + data);
  updateMessageLog(messageData, username);
}

function setupChat () {
	// Socket custom event trigger for message response, passing in our function for a callback
	socket.on('chat-message-response', handleMessageData);
  socket.on('connection-response', linkConnection);
  //socket.on('status-response', updateMessageLog);
  socket.on('map-data-response', saveMapUpdate);

  socket.on('character-details-update-status', handleCharacterUpdateResponse);

  socket.on('request-password', requestUserPassword); //  Request for existing password
  socket.on('request-new-password', userDoesNotExist); //  Request for new password

  //emit('login-success', userData['username'])
  socket.on('login-success', handlePlayerLogin);
  socket.on('login-failure', handlePlayerLoginError);
  socket.on('session-error', handleSessionError);
}
