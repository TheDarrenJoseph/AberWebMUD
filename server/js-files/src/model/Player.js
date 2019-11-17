import MapCharacter from '../model/pixi/map/MapCharacter.js'
import CharacterDetailsBuilder from './page/CharacterDetailsBuilder'
import ValidationHandler from '../handler/ValidationHandler'
import { CHARACTER_JSON_NAME } from './page/CharacterDetails'

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
			let characterDetails = new CharacterDetailsBuilder().withDefaults().build()
			this.mapCharacter = new MapCharacter(characterDetails);
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
			console.debug('Set Player username to: ' + username);
		} else {
			throw new RangeError(INVALID_USERNAME_MSG + username);
		}
	}

	getMapCharacter() {
		return this.mapCharacter;
	}

	setMapCharacter(mapCharacter) {
		this.mapCharacter = mapCharacter;
	}

	/**
	 * @throws RangeError on any failed validation of update data
	 * @param jsonData in the format of { 'username' : string, 'character' : characterJson }
	 */
	updateFromJson (jsonData) {
		ValidationHandler.validateAttribute(jsonData, 'username')
		this.setUsername(jsonData['username'])

		ValidationHandler.validateAttribute(jsonData, 'character')
		let attributesJson = ValidationHandler.validateAndGetAttribute(jsonData, CHARACTER_JSON_NAME);
		this.getMapCharacter().getCharacterDetails().setAttributesFromJson(attributesJson);
	}

	static validUsername(username) {
		return ( username !== undefined &&
		typeof username === 'string' &&
		username.length > 0);
	}
}


// Allow named import also
export { Player };