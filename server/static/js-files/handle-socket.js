var socket = null;

var clientSession = {
  username: null,
  character: {charname: null, posX: null, posY: null},
  sessionId: null
}

function getSessionInfoJSON(){
  var username = clientSession.username;
  var sessionId = clientSession.sessionId;

  return {sessionId: sessionId, username: username}
}

function sendNewChatMessage() {
  var userInput = $('#message-input').val();
	//console.log('message sent!: \''+userInput+'\'');
  sessionJson = getSessionInfoJSON();

  //console.log(sessionJson)

  if (userInput !== '') {
	   socket.emit('new-chat-message', {data: userInput, sessionJson});
  }
}

//Tries to send movement input for the current user
function sendMovementCommand(x,y) {
  var username = clientSession.username;
  var sessionId = clientSession.sessionId;

  if (username != null && sessionId != null) {
  	socket.emit('movement-command', {sessionId: sessionId, username: username, moveX: x, moveY: y});
  }
}

//Send the user's password to the sever
function sendAuthentication(username, passwordFieldVal){
  console.log('sending ' + username + ' ' + passwordFieldVal);
  clientSession.username = username;
  socket.emit('client-auth', {'username': username, 'password': passwordFieldVal});
}

//Save our given session id for later, and display the welcome message
function link_connection(data){
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

function setStatusUpdateCallbacks (movementResponseCallback, movementUpdateCallback) {
    socket.on('movement-response', movementResponseCallback);
    socket.on('movement-update', movementUpdateCallback);
}

function saveMapUpdate (mapData) {
  overworldMap = JSON.parse(mapData['data']);
  overworldMapSizeX = mapData['map-size-x'];
  overworldMapSizeY = mapData['map-size-y'];
  console.log('MAP DATA RECEIVED');
  drawMapToGrid ();
}

function handleSessionError () {
  console.log('Session Error!');
}

function setupChat () {
	// Socket custom event trigger for message response, passing in our function for a callback
	socket.on('chat-message-response', updateMessageLog);
  socket.on('connection-response', link_connection);
  //socket.on('status-response', updateMessageLog);
  socket.on('map-data-response', saveMapUpdate);

  socket.on('request-password', requestUserPassword); //Request for existing password
  socket.on('request-new-password', requestUserPassword); //Request for new password

  //emit('login-success', userData['username'])
  socket.on('login-success', handlePlayerLogin);
  socket.on('session-error', handleSessionError);
}
