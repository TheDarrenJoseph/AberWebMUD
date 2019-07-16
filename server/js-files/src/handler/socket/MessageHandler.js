import { Session, SessionModel } from 'src/model/Session.js';
import { Player } from 'src/model/Player.js';

//	Export vars we may want to unpack
export const SESSION_JSON_NAME = 'sessionJson';

//	Other constants for message format
export const DATA_JSON_NAME = 'data';

export const MOVE_X_JSON_NAME = 'moveX';
export const MOVE_Y_JSON_NAME = 'moveY';

export const MAPSIZE_X_JSON_NAME = 'map-size-x';
export const MAPSIZE_Y_JSON_NAME = 'map-size-y';

//	Static helper class
// Defines and handles the expected format of SocketIO messages
// More specifically, creates JSON with correct format
// To be sent alongside a io Event
class MessageHandler {

	/**
	 * For now just verifies that we've set a sane SessionID
	 * @param sessionJson
	 * @returns {*}
	 */
	static isSessionInfoValid (sessionJson) {
		let sessionId = sessionJson.sessionId;
		return SessionModel.validSessionId(sessionId);
	}

	static attachSessionJson (message) {
		var sessionJson = Session.ActiveSession.getSessionInfoJSON();
		if (MessageHandler.isSessionInfoValid(sessionJson)) {
			message[SESSION_JSON_NAME] = sessionJson;
		} else {
			console.log('Session info invalid/missing for message: ' + JSON.stringify(message));
		}
		return message;
	}

	//	Data messages for generic data transfer for specific io events
	static createDataMessage (data) {
		// Make sure we send session info with all messages
		var message = {};
		message[DATA_JSON_NAME] = data;
		message = MessageHandler.attachSessionJson(message);
		return message;
	}

	// Create a movement message for our session using the given co-ords
	static createMovementMessage (x, y) {
		//	Check we have the needed session info
		var message = {};
		message[MOVE_X_JSON_NAME] = x;
		message[MOVE_Y_JSON_NAME] = y;
		message = MessageHandler.attachSessionJson(message);
		return message;
	}
}

export { MessageHandler };
