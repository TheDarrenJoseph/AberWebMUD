
var sessionIdCookieName = "sessionId"

//  Local data stored for your current character
var charAttributes = {
  str: null,
  dex: null,
  con: null,
  int: null,
  wis: null,
  cha: null
}

var charData = {
  charname: null, pos_x: null, pos_y: null, attributes: charAttributes, class: null, health: null, free_points: null
};

var clientSession = {
  username: null,
  sessionId: null,
  character: charData
};

function saveSessionIdCookie(sessionId){
  console.log("Saving sessionId "+sessionId+" to cookie");
  document.cookie = sessionIdCookieName+"="+sessionId+";"
}

function getSessionIdCookie(sessionId){
  var decodedCookie = decodeURIComponent(document.cookie);
  //Split on endline, in case we ever store more  than 1 variable
  var cookiesList = decodedCookie.split(";")

  //Then split out the mapping and return that
  return cookiesList[0].split('=')[1]
}

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


//Extracts the session data  (username and session ID) into a JSON object
function getSessionInfoJSON() {
  var username = clientSession.username;
  var sessionId = clientSession.sessionId;

  return {sessionId: sessionId, username: username};
}


//Example JSON
//{"charname":"roo","pos_x":10,"pos_y":10,"health":100,"charclass":"fighter","free_points":5,"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}
function updateCharacterDetails (data) {
  console.log(data);
  clientSession.character.charname = data['charname'];
  clientSession.character.class = data['charclass'];
  clientSession.character.pos_x = data['pos_x'];
  clientSession.character.pos_y = data['pos_y'];
  clientSession.character.class = data['charclass'];
  clientSession.character.health = data['health'];
  clientSession.character.free_points = data['free_points'];

  clientSession.character.attributes.str = data['STR'];
  clientSession.character.attributes.dex = data['DEX'];
  clientSession.character.attributes.con = data['CON'];
  clientSession.character.attributes.int = data['INT'];
  clientSession.character.attributes.wis = data['WIS'];
  clientSession.character.attributes.cha = data['CHA'];


  console.log(clientSession.character.attributes);

  console.log('clientSession updated.');
  console.log(clientSession);
}

function setClientSessionSessionId(data) {
    //	Update the client session to contain our new data
    if (data['sessionId'] != null) {
      var sessId = data['sessionId'];

    clientSession.sessionId = sessId;
    //also save it in a cookie
    saveSessionIdCookie(sessId);
  }
}

function updateClientSessionData (data) {
	//var playerStatus = data['player-status'];
	console.log('Login data received: ');
	console.log(data);

  setClientSessionSessionId(data);
  updateCharacterDetails(data);

	console.log('Saved session object: ');
	console.log(clientSession);
}

//Save our given session id for later, and display the welcome message
function linkConnection(data){
  if (getSessionIdCookie() == null) {
    setClientSessionSessionId(data);
    console.log('Handshaked with server, session ID given:' + clientSession.sessionId);
    setMessageLog(data['messageData']); //Add the welcome message to the message log
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
