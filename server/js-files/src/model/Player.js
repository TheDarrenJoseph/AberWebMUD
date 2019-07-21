import MapCharacter from 'src/model/pixi/map/MapCharacter.js'

export const INVALID_USERNAME_MSG = 'Cannot set invalid username: ';

/**
 *
 */
export default class Player {

	constructor (username, mapCharacter){
		if (username == undefined) {
			throw new RangeError("No username provided.");
		}

		this.username = username;

		if (mapCharacter == undefined) {
			this.mapCharacter = new MapCharacter();
		} else {
			this.mapCharacter = mapCharacter;
		}

	}

	_validUsername(username) {
		return username !== undefined && username !== null && typeof username == 'string' && username.length > 0;
	}

	getUsername() {
		return this.username;
	}

	setUsername(username) {
		if (this._validUsername(username)) {
			this.username = username;
		} else {
			throw new RangeError(INVALID_USERNAME_MSG + username);
		}
	}

	getCharacter() {
		return this.mapCharacter;
	}

	setCharacter(mapCharacter) {
		this.mapCharacter = mapCharacter;
	}

	updateFromJson(jsonData) {
		if (jsonData.hasOwnProperty('username')) {
			this.setUsername(jsonData['username']);
		} else {
			throw new RangeError (' Expected property \'username\' in jsonData: ' + JSON.stringify(jsonData));
		}

		// Optional parameter
		if (jsonData.hasOwnProperty('character')) {
			this.getCharacter().setCharacterDetails(jsonData['character']);
		}
	}

	static validUsername(username) {
		return ( username !== undefined &&
		typeof username === 'string' &&
		username.length > 0);
	}
}


// Allow named import also
export { Player };