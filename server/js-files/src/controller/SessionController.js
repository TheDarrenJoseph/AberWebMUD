import { SESSION_ID_COOKIE_NAME, Session } from 'src/model/SessionModel.js';
import { MessageHandler } from 'src/handler/socket/MessageHandler.js';

class SessionController {
	static saveSessionIdCookie (sessionId) {
		console.log('Saving sessionId ' + sessionId + ' to cookie');
		document.cookie = SESSION_ID_COOKIE_NAME + '=' + sessionId + ';';
	};

	static getSessionIdCookie (sessionId) {
		var decodedCookie = decodeURIComponent(document.cookie);
		//	Split on endline, in case we ever store more  than 1 variable
		var cookiesList = decodedCookie.split(';');

		//	Then split out the mapping and return that
		return cookiesList[0].split('=')[1];
	};

	static characterDetailsExist () {
		if (Session.clientSession.character == null ||
				Session.clientSession.character.charname == null ||
				Session.clientSession.character.attributes == null ||
				Session.clientSession.character.class == null ||
				Session.clientSession.character.health == null) {
			return false;
		}

		return true;
	};

	//	Extracts the session data  (username and session ID) into a JSON object
	static getSessionInfoJSON () {
		var username = Session.clientSession.username;
		var sessionId = Session.clientSession.sessionId;

		return {sessionId: sessionId, username: username};
	};

	//	Example JSON
	//	{"charname":"roo","pos_x":10,"pos_y":10,"health":100,"charclass":"fighter","free_points":5,"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}
	static updateCharacterDetails (data) {
		console.log(data);
		Session.clientSession.character.charname = data['charname'];
		Session.clientSession.character.class = data['charclass'];
		Session.clientSession.character.pos_x = data['pos_x'];
		Session.clientSession.character.pos_y = data['pos_y'];
		Session.clientSession.character.class = data['charclass'];
		Session.clientSession.character.health = data['health'];
		Session.clientSession.character.free_points = data['free_points'];

		Session.clientSession.character.attributes.str = data['STR'];
		Session.clientSession.character.attributes.dex = data['DEX'];
		Session.clientSession.character.attributes.con = data['CON'];
		Session.clientSession.character.attributes.int = data['INT'];
		Session.clientSession.character.attributes.wis = data['WIS'];
		Session.clientSession.character.attributes.cha = data['CHA'];

		console.log(Session.clientSession.character.attributes);

		console.log('clientSession updated.');
		console.log(Session.clientSession);
	};

	//	Save our given session id for later, and display the welcome message
	static linkConnectionToSession (data) {
		if (SessionController.getSessionIdCookie() == null) {
			Session.setClientSessionSessionId(data);
			console.log('Handshaked with server, session ID given:' + Session.getClientSession().sessionId);
		} else {
			console.log('Reconnected, using old SID');
		}
	};

	static setClientSessionSessionId (data) {
		//	Update the client session to contain our new data
		if (data['sessionId'] != null) {
			var sessId = data['sessionId'];

			Session.clientSession.sessionId = sessId;
			//	Also save it in a cookie
			SessionController.saveSessionIdCookie(sessId);
		}
	};

	static updateClientSessionData (data) {
		//	var playerStatus = data['player-status'];
		console.log('Login data received: ');
		console.log(data);

		SessionController.setClientSessionSessionId(data);
		SessionController.updateCharacterDetails(data);

		console.log('Saved session object: ');
		console.log(Session.clientSession);
	};

	static saveMapUpdate (mapJson) {
		MessageHandler.updateMapFromResponse(Map, mapJson);
		console.log('MAP DATA RECEIVED');
	};
}

export { SessionController };
