import ValidationHandler from 'src/handler/ValidationHandler.js';
import Player from 'src/model/Player.js';

const DEBUG=false;
export const SESSION_ID_COOKIE_NAME = 'sessionId';

// Login response validation
export const EXPECTED_LOGIN_SUCCESS_PARAMS = ['sessionId', 'player-status'];
export const ERROR_LOGIN_RS_MISSING_USERNAME = new RangeError('Username missing on login response!')
export const ERROR_LOGIN_RS_MISSING_CHARDETAILS = new RangeError('Character details missing on login response!')

/**
 * Once connected to the server we need to store a few things
 * i.e The SessionID token, Player Details, etc
 * This provides a centralised storage place (Singleton) that can be referenced at any point
 */
class SessionModel {
	constructor () {
		this.doc = document;
		this.clientSession = {
			player: new Player(""),
			sessionId: null,
		};
	};

	_checkPlayer(player) {
		let hasPlayer = clientSession['player'] != undefined && clientSession['player'] instanceof Player;
		if (!hasPlayer) throw new RangeError('Expected an instance of Player!')
	}

	_checkSessionId(sessionId) {
		let hasSessionId = ValidationHandler.notUndefOrNull(sessionId) && typeof sessionId === 'string'
		//	Update the client session to contain our new data
		if (!hasSessionId) {
			if (!hasSessionId) throw new Range('Expected a defined sessionId!')
		}
	}

	getClientSession() {
		return this.clientSession;
	}

	setClientSession(clientSession) {
		this._checkPlayer(clientSession['player']);
		this._checkSessionId(clientSession['sessionid']);

		if (!hasPlayer) throw new RangeError('Expected an instance of Player!')
		if (!hasSessionId) throw new Range('Expected a defined sessionId!')

		this.clientSession = clientSession;
	}

	getPlayer() {
		return this.clientSession.player;
	}

	setPlayer(player) {
		this._checkPlayer(player);
		this.clientSession.player = player;
	}

	getSessionId() {
		return this.clientSession.sessionId;
	}

	setSessionId (sessionId) {
		//	Update the client session to contain our new data
		this._checkSessionId(sessionId);
		this.clientSession.sessionId = sessionId;
	}

	//getCharacterDetails () {F
	//	return this.clientSession.characterDetails;
	//}

	//setCharacterDetails (charDetails) {
	//	this.clientSession.characterDetails = charDetails;
	//}

	saveSessionIdCookie (sessionId) {
		this._checkSessionId(sessionId)
		console.log('Saving sessionId ' + sessionId + ' to cookie');
		Session.ActiveSession.doc.cookie = SESSION_ID_COOKIE_NAME + '=' + sessionId + ';';
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

	/**
	 * Sets the username, sessionid, and Character Details JSON for reference
	 * @param data
	 */
	setClientSessionData (data) {
		if (ValidationHandler.checkDataAttributes(data, EXPECTED_LOGIN_SUCCESS_PARAMS)) {
			let sid = data['sessionId'];
			let playerStatus = data['player-status'];

			let usernamePresent = ValidationHandler.checkDataAttributes(playerStatus, ['username']);
			let detailsPresent = ValidationHandler.checkDataAttributes(playerStatus, ['char-details']);
			// Check character details are present, throw useful exception otherwise

			if (!usernamePresent) {
				throw ERROR_LOGIN_RS_MISSING_USERNAME;
			}

			if (usernamePresent && !detailsPresent) {
				throw ERROR_LOGIN_RS_MISSING_CHARDETAILS;
			}

			if (usernamePresent && detailsPresent) {
				console.log('Updating session with response data: ' + JSON.stringify(data));

				// Update user details
				Session.ActiveSession.clientSession.sessionId = sid;
				Session.ActiveSession.clientSession.player.setUsername(playerStatus['username']);
				Session.ActiveSession.clientSession.player.getCharacter().setCharacterDetails(playerStatus['char-data']);
			}
		}
	}

	static validSessionId(sessionId) {
		return ( sessionId !== undefined &&
		typeof sessionId === 'string' &&
		sessionId.length > 0);
	}

}

// Allow re-pointing and modifying the session contained
var Session = { ActiveSession : new SessionModel() };

export { Session, SessionModel };
