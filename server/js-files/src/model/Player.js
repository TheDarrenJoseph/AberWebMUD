import MapCharacter from 'src/model/pixi/map/MapCharacter.js';

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

	getUsername() {
		return this.username;
	}

	setUsername(username) {
		this.username = username;
	}

	getCharacter() {
		return this.mapCharacter;
	}

	setCharacter(mapCharacter) {
		this.mapCharacter = mapCharacter;
	}

	static validUsername(username) {
		return ( username !== undefined &&
		typeof username === 'string' &&
		username.length > 0);
	}
}


// Allow named import also
export { Player };