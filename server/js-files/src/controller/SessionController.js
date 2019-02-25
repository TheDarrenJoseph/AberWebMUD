import ValidationHandler from 'src/handler/ValidationHandler.js';

import { SESSION_ID_COOKIE_NAME, Session } from 'src/model/Session.js';
import { MessageHandler } from 'src/handler/socket/MessageHandler.js';

const invalid_char_update_data = 'Character update data is invalid: ';
const invalid_session_data = 'Session data is invalid: ';

export default class SessionController {
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
				Session.clientSession.character.charClass == null ||
				Session.clientSession.character.health == null) {
			return false;
		}

		return true;
	};
	
	static setClientSessionUsername(username) {
		Session.clientSession.username = username;
	}
	
	static getClientSessionUsername () {
		return Session.clientSession.username;
	}

	static getClientSessionId () {
		return Session.clientSession.sessionId;
	}

	static getClientSessionCharacter () {
		return Session.clientSession.character;
	}
	
	static setClientSessionCharacter (character) {
		Session.clientSession.character = character;
	}


	//	Extracts the session data  (username and session ID) into a JSON object
	static getSessionInfoJSON () {
		var username = SessionController.getClientSessionUsername();
		var sessionId = SessionController.getClientSessionId();

		return {sessionId: sessionId, username: username};
	};

	static updateCharacterDetails (data) {
		let character = SessionController.getClientSessionCharacter();
		
		if (ValidationHandler.isValidCharacterData(data)) {
			character.charname = data['charname'];
			character.charClass = data['charclass'];
			character.pos_x = data['pos_x'];
			character.pos_y = data['pos_y'];
			character.health = data['health'];
			character.free_points = data['free_points'];
		
			// Create the attributes JSON if needed
			if (character.attributes == undefined) {
				character.attributes = {};
			}
			
			let scores = data['scores'];
			character.attributes.STR = scores['STR'];
			character.attributes.DEX = scores['DEX'];
			character.attributes.CON = scores['CON'];
			character.attributes.INT = scores['INT'];
			character.attributes.WIS = scores['WIS'];
			character.attributes.CHA = scores['CHA'];
		} else {
			throw new RangeError(invalid_char_update_data + JSON.stringify(data));
		}

		// For debugging
		console.log('clientSession char details updated:');
		console.log(character);
		console.log('SID: ' + SessionController.getClientSessionId());
	};
	
	//	Save our given session id for later, and display the welcome message
	static linkConnectionToSession (data) {
		// If we've not stored a cookie this is a new session
		if (SessionController.getSessionIdCookie() == null) {
			SessionController.setClientSessionSessionId(data);
			console.log('Handshaked with server, session ID given:' + SessionController.getClientSessionId());
		} else {
			console.log('Reconnected, using old SID');
		}
	};

	static setClientSessionSessionId (sessionId) {
		//	Update the client session to contain our new data			
		if (ValidationHandler.notUndefOrNull(sessionId)) {
			Session.clientSession.sessionId = sessionId;
			//	Also save it in a cookie
			SessionController.saveSessionIdCookie(sessionId);
		} else {
			throw new RangeError(invalid_session_data + ' (SessionId) ' + sessionId);
		}
	};

	static updateClientSessionData (data) {
		console.log('Updating session with');
		console.log(data);		
		if (ValidationHandler.checkDataAttributes(data, ['username', 'sessionId', 'char-data'])) {
			console.log('Updating session with: '+JSON.stringify(data))
			SessionController.setClientSessionUsername(data['username']);
			SessionController.setClientSessionSessionId(data['sessionId']);
			SessionController.updateCharacterDetails(data['char-data']);
		}
		
		console.log('Saved session object: ');
		console.log(Session.clientSession);
	};

	static saveMapUpdate (mapJson) {
		MessageHandler.updateMapFromResponse(Map, mapJson);
		console.log('MAP DATA RECEIVED');
	};
}
