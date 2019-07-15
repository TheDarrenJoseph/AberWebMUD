import ValidationHandler from 'src/handler/ValidationHandler.js';
import Player from 'src/model/Player.js';

const DEBUG=false;
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

	setSessionId (sessionId) {
		//	Update the client session to contain our new data
		if (ValidationHandler.notUndefOrNull(sessionId) && typeof sessionId === 'string') {
			this.clientSession.sessionId = sessionId;
		} else {
			throw new RangeError('Session ID is invalid: ' + JSON.stringify(sessionId));
		}

	}

	//getCharacterDetails () {F
	//	return this.clientSession.characterDetails;
	//}

	//setCharacterDetails (charDetails) {
	//	this.clientSession.characterDetails = charDetails;
	//}

	saveSessionIdCookie (sessionId) {
		if (ValidationHandler.notUndefOrNull(sessionId) & typeof sessionId === 'string' ) {
			console.log('Saving sessionId ' + sessionId + ' to cookie');
			Session.ActiveSession.doc.cookie = SESSION_ID_COOKIE_NAME + '=' + sessionId + ';';
		} else {
			throw new RangeError('Expected SessionId String to save!');
		}
	};

	getSessionIdCookie () {
		var decodedCookie = decodeURIComponent(Session.ActiveSession.doc.cookie);

		if (decodedCookie.length > 0) {
			console.log('Retrieved cookie: ' + JSON.stringify(decodedCookie));

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
	linkConnectionToSession (json) {
		let sessionId = json.sessionId;

		if (sessionId !== undefined) {
			let cookieSid = this.getSessionIdCookie();
			// If we've not stored a cookie this is a new session
			if (cookieSid == null) {

				console.log('Saving session ID: ' + JSON.stringify(sessionId))
				this.setSessionId(sessionId);
				//	Also save it in a cookie
				this.saveSessionIdCookie(sessionId);
				console.log('Handshaked with server, session ID given:' + sessionId);
			} else {
				console.log('Reconnected, using old SID: ');
				console.log(cookieSid);
				this.setSessionId(cookieSid);
			}
		} else {
			throw new RangeError('Expected Session ID returned by the server, JSON proviced: ' + JSON.stringify(json));
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

	static validSessionId(sessionId) {
		return ( sessionId !== undefined &&
		typeof sessionId === 'string' &&
		sessionId.length > 0);
	}

}

// Allow re-pointing and modifying the session contained
var Session = { ActiveSession : new SessionModel() };

export { Session, SessionModel };
