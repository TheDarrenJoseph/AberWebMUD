import ValidationHandler from 'src/handler/ValidationHandler.js';
import Player from 'src/model/Player.js';

export const SESSION_ID_COOKIE_NAME = 'sessionId';

class SessionModel {
	constructor () {
		this.doc = document;
		// Things we'll need to communicate with the server
		this.clientSession = {
			player: new Player(""),
			sessionId: null,
		};
	};

	getSessionId() {
		return this.clientSession.sessionId;
	}

	setSessionId (sessId) {
		//	Update the client session to contain our new data
		if (ValidationHandler.notUndefOrNull(sessId)) {
			this.clientSession.sessionId = sessId;
		} else {
			throw new RangeError('Session data is invalid: ' + ' (SessionId) ' + sessId);
		}

	}

	//getCharacterDetails () {F
	//	return this.clientSession.characterDetails;
	//}

	//setCharacterDetails (charDetails) {
	//	this.clientSession.characterDetails = charDetails;
	//}

	saveSessionIdCookie (sessionId) {
		console.log('Saving sessionId ' + sessionId + ' to cookie');
		Session.ActiveSession.doc.cookie = SESSION_ID_COOKIE_NAME + '=' + sessionId + ';';
	};

	getSessionIdCookie () {
		var decodedCookie = decodeURIComponent(Session.ActiveSession.doc.cookie);

		if (decodedCookie.length > 0) {
			console.log('Retrieved cookie: ' + decodedCookie);

			//	Split on endline, in case we ever store more  than 1 variable
			var cookiesList = decodedCookie.split(';');

			let cookieString = String(cookiesList[0].split('=')[1]);
			console.log('Cookie string: ' + cookieString);
			//	Then split out the mapping and return that
			return cookieString;
		} else {
			return null;
		}
	};

	//	Extracts the session data  (username and session ID) into a JSON object
	getSessionInfoJSON () {
		return {sessionId: this.getSessionId(), username: this.clientSession.player.getUsername()};
	};

	//	Save our given session id for later, and display the welcome message
	linkConnectionToSession (sessionId) {
		let cookieSid = this.getSessionIdCookie();
		// If we've not stored a cookie this is a new session
		if (cookieSid == null) {
			this.setSessionId(sessionId);
			//	Also save it in a cookie
			this.saveSessionIdCookie(sessionId);
			console.log('Handshaked with server, session ID given:' + sessionId);
		} else {
			console.log('Reconnected, using old SID: ');
			console.log(cookieSid);
			this.setSessionId(cookieSid);
		}
	};

	updateClientSessionData (data) {
		if (ValidationHandler.checkDataAttributes(data, ['username', 'sessionId', 'char-data'])) {
			console.log('Updating session with: '+JSON.stringify(data));

			// Update user details
			Session.ActiveSession.clientSession.player.setUsername(data['username']);
			Session.ActiveSession.clientSession.player.getCharacter().setCharacterDetails(data['char-data']);

			Session.ActiveSession.clientSession.sessionId = data['sessionId'];
		};
	};

}

// Allow re-pointing and modifying the session contained
var Session = { ActiveSession : new SessionModel() };

export { Session, SessionModel };
