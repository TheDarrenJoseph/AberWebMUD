import ValidationHandler from 'src/handler/ValidationHandler.js';
import Player from 'src/model/Player.js';

import { EventMapping } from 'src/helper/EventMapping.js';

const DEBUG=false;
export const SESSION_ID_COOKIE_NAME = 'sessionId';


// January 1, 1970, 00:00:00 UTC
const EPOCH_DATE = Date(0);

export const EVENTS = { ACTIVE_SESSION : 'active-sesion', INACTIVE_SESSION: 'inactive-session' };


/**
 * Once connected to the server we need to store a few things
 * i.e The SessionID token, Player Details, etc
 * This provides a centralised storage place (Singleton) that can be referenced at any point
 */
class SessionModel extends EventMapping {
	constructor () {
		super(EVENTS);

		this.doc = document;
		this.clientSession = {
			player: new Player(""),
			sessionId: null,
			activeSession: false
		};
	};

	_checkPlayer(player) {
		let hasPlayer = clientSession['player'] != undefined && clientSession['player'] instanceof Player;
		if (!hasPlayer) throw new RangeError('Expected an instance of Player!')
	}

	_checkSessionId(sessionId) {
		if (ValidationHandler.validString(sessionId)) {
			return true;
		} else {
			throw new RangeError('Expected a Session ID string!, received: ' + sessionId)
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

	_setSessionId (sessionId) {
		//	Update the client session to contain our new data
		this._checkSessionId(sessionId);
		this.clientSession.sessionId = sessionId;
	}

	isActiveSession() {
		return this.clientSession.activeSession
	}

	handleSessionActivity(activeBool) {
		if (activeBool) {
			this.emit(EVENTS.ACTIVE_SESSION)
		} else {
			this.emit(EVENTS.INACTIVE_SESSION)
		}
	}

	setActiveSession(activeBool) {
		if (typeof activeBool === "boolean") {
			this.clientSession.activeSession = activeBool;
			this.handleSessionActivity(activeBool);
		} else {
			throw new RangeError('Expected a boolean, received: ' + activeBool)
		}
	}

	/**
	 * Set upon successful connection to the server
	 * @returns {*|boolean}
	 */
	isSessionIdSet() {
		let sessionId = this.getSessionId();
		return ValidationHandler.notUndefOrNull(sessionId) && typeof sessionId === 'string'
	}

	//getCharacterDetails () {
	//	return this.clientSession.characterDetails;
	//}

	//setFromJson (charDetails) {
	//	this.clientSession.characterDetails = charDetails;
	//}

	saveSessionIdCookie (sessionId) {
		let expiryDate = new Date();
		// Increment the day by one, Date will handle rollover
		expiryDate.setHours(expiryDate.getHours() + 1);

		this._checkSessionId(sessionId)
		console.log('Saving sessionId ' + sessionId + ' to cookie' + ' with expiry: ' + expiryDate);
		Session.ActiveSession.doc.cookie = SESSION_ID_COOKIE_NAME + '=' + sessionId + ';' + 'expires=' + expiryDate;
	};

	deleteSessionIdCookie() {
		let cookieSid = this.getSessionIdCookie();

		if (cookieSid != null) {
			console.log('Removing cookie for SID: ' + cookieSid);
			Session.ActiveSession.doc.cookie = SESSION_ID_COOKIE_NAME + '=;expires=' + EPOCH_DATE;
		}
	}

	getSessionIdCookie () {
		var decodedCookie = decodeURIComponent(Session.ActiveSession.doc.cookie);

		if (decodedCookie.length > 0) {
			console.log('Retrieved cookie: ' + JSON.stringify(decodedCookie));

			//	Split on endline, in case we ever store more  than 1 variable
			var cookiesList = decodedCookie.split(';');

			let cookieString = String(cookiesList[0].split('=')[1]);
			//console.log('Cookie string: ' + cookieString);
			//	Then split out the mapping and return that
			return cookieString;
		} else {
			return null;
		}
	};

	//	Extracts the session data  (username and session ID) into a JSON object
	getSessionInfoJSON () {
		let json = {sessionId: this.getSessionId(), username: this.getPlayer().getUsername()};
		console.debug('Session INFO: ' + JSON.stringify(json));
		return json;
	};

	//	Save our given session id for later, and display the welcome message
	linkConnectionToSession (json) {
		let sessionId = json.sessionId;

		if (sessionId !== undefined) {
			let cookieSid = this.getSessionIdCookie();
			// If we've not stored a cookie this is a new session
			if (cookieSid == null) {

				console.log('Saving session ID: ' + JSON.stringify(sessionId))
				this._setSessionId(sessionId);
				//	Also save it in a cookie
				this.saveSessionIdCookie(sessionId);
				console.log('Handshaked with server, session ID given:' + sessionId);
			} else {
				console.log('Reconnected, using old SID: ');
				console.log(cookieSid);
				this._setSessionId(cookieSid);
			}

			return this.getSessionId();
		} else {
			throw new RangeError('Expected Session ID returned by the server, JSON proviced: ' + JSON.stringify(json));
		}
	};

	setClientSessionID(sid) {
		let idPresent = ValidationHandler.notUndefOrNull(sid);
		if (idPresent) {
			this._setSessionId(sid);
		} else {
			throw new RangeError('Session ID not defined!');
		}
	}


	updatePlayer(jsonData) {
		this.getPlayer().updateFromJson(jsonData);
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
