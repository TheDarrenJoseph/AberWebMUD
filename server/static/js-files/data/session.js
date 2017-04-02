//Local data stored for your current character
var charData = {
  charname: null, pos_x: null, pos_y: null, attributes: null, class: null, health: null
};

var clientSession = {
  username: null,
  character: charData,
  sessionId: null
};

function characterDetailsExist () {
  if (clientSession.character == null ||
      clientSession.character.charname == null ||
      clientSession.character.attributes == null ||
      clientSession.character.class == null ||
      clientSession.character.health == null) {
         return false;
  } else {
    return true;
  }
}


//Extracts the session data into a JSON object
function getSessionInfoJSON() {
  var username = clientSession.username;
  var sessionId = clientSession.sessionId;

  return {sessionId: sessionId, username: username}
}

function updateClientSessionData(data){
	var playerStatus = data['player-status'];
	console.log('Login data received: ');
	console.log(data);

	//	Update the client session to contain our new data
	clientSession.sessionId = data['sessionId'];

	clientSession.username = playerStatus['username'];
	clientSession.character.charname = playerStatus['charname'];
	clientSession.character.pos_x = playerStatus['pos_x'];
	clientSession.character.pos_y = playerStatus['pos_y'];

	console.log('Saved session object: ');
	console.log(clientSession);
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

function saveMapUpdate (mapData) {
  overworldMap = JSON.parse(mapData['data']);
  overworldMapSizeX = mapData['map-size-x'];
  overworldMapSizeY = mapData['map-size-y'];
  console.log('MAP DATA RECEIVED');
}

function handleSessionError () {
  console.log('Session Error!');
}
