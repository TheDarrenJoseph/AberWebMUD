import { Session } from 'src/model/Session.js';

//	Export vars we may want to unpack
export var SESSION_JSON_NAME = 'sessionJson';

//	Other constants for message format
export var DATA_JSON_NAME = 'data';

export var MOVE_X_JSON_NAME = 'moveX';
export var MOVE_Y_JSON_NAME = 'moveY';

export var MAPSIZE_X_JSON_NAME = 'map-size-x';
export var MAPSIZE_Y_JSON_NAME = 'map-size-y';

//	Static helper class
// Defines and handles the expected format of SocketIO messages
// More specifically, creates JSON with correct format
// To be sent alongside a socket Event
class MessageHandler {
	static isSessionInfoValid (sessionJson) {
		if (sessionJson.username != null && sessionJson.sessionId != null) {
			return true;
		} else {
			return false;
		}
	}

	static attachSessionJson (message) {
		var sessionJson = Session.getSessionInfoJSON();
		if (MessageHandler.isSessionInfoValid(sessionJson)) {
			message.SESSION_JSON_NAME = sessionJson;
		}

		console.log('Session info missing for message: ' + JSON.stringify(message));
		return message;
	}

	//	Data messages for generic data transfer for specific socket events
	static createDataMessage (data) {
		// Make sure we send session info with all messages
		var message = {DATA_JSON_NAME: data, SESSION_JSON_NAME: null};
		message = MessageHandler.attachSessionJson(message);
		return message;
	}

	// Create a movement message for our session using the given co-ords
	static createMovementMessage (x, y) {
		//	Check we have the needed session info
		var message = {MOVE_X_JSON_NAME: x, MOVE_Y_JSON_NAME: y, SESSION_JSON_NAME: null};
		message = MessageHandler.attachSessionJson(message);
		console.log(message);
		return message;
	}

	/**
	 * THis unpacks a JSON map response from the server and updates the existing map model.
	 * Not sure where we should unpack JSON just yet, but this seems apt for now
	 * @param map
	 * @param json
	 */
	static updateMapFromResponse (map, json) {
		// Unpack the message data
		let mapTiles = JSON.parse(json[MessageHandler.DATA_JSON_NAME]);
		let mapSizeX = json[MessageHandler.MAPSIZE_X_JSON_NAME];
		let mapSizeY = json[MessageHandler.MAPSIZE_Y_JSON_NAME];

		// TODO Parse tiles and update MapModel
	}
}

export { MessageHandler };
