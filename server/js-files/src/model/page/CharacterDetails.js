import ValidationHandler from 'src/handler/ValidationHandler.js'

import { EventMapping } from 'src/helper/EventMapping.js'

//import jquery from 'jquery'
import jquery from 'libs/jquery-3.4.1.dev.js';
import { CharacterClassOptions } from 'src/model/page/CharacterClassOptions.js'
import { ArraySet } from 'src/model/ArraySet.js'
import {
	AttributeScores,
	FREEPOINTS_NAME,
	SCORES_NAME
} from 'src/model/page/AttributeScores.js'
import { ATTRIBUTES_NAME } from './AttributeScores'

export var CHARACTER_UPDATE_ATTRIBS = ['success', 'character']
export var CHARACTER_DATA_ATTRIBS = ['charname', 'pos_x', 'pos_y', 'health', 'charclass', 'free_points', 'attributes']

//	2 arrays of the same length to allow looping for creating each line of the table
// Fortitude, Intellect, Awareness, Arcana, Agility

// TODO This does not belong in the model, refactor/dynamically generate!
export const EVENTS = {
	SET_DETAILS: 'set-details', // For full setter calls
	CONFIRM_DETAILS: 'confirm-details', // For first-time setting of stats, in response to server confirmation
	SET_ATTRIB_SCORES: 'set-attribute-scores', //Any attrib score updates
	SET_CLASS_OPTIONS: 'set-class-options'  // Any class option update
}

const INVALID_CHAR_UPDATE_DATA_ERROR = 'Character update data is invalid: '

// TODO Remove this
export var CLASS_OPTIONS = [
	{ id: 'fighter', text: 'Fighter' },
	{ id: 'spellcaster', text: 'Spellcaster' }
]

export const CHARACTER_JSON_NAME = 'character'
export const ATTRIBUTES_JSON_NAME = 'attributes'
export const CHARNAME_JSON_NAME = 'charname'
export const POSITION_JSON_NAME = 'position'
export const POSITION_X_JSON_NAME = 'pos_x'
export const POSITION_Y_JSON_NAME = 'pos_y'
export const HEALTH_JSON_NAME = 'health'
export const CHARCLASS_JSON_NAME = 'charclass'

export default class CharacterDetails extends EventMapping {
	constructor (characterClassOptions, attributeScores, minScoreValue, maxScoreValue, posX, posY, health, freePoints) {
		super(EVENTS)

		if (characterClassOptions === undefined || !characterClassOptions instanceof CharacterClassOptions) {
			throw new RangeError('Character class options required!')
		}

		if (attributeScores === undefined) {
			throw new RangeError('Attribute scores JSON required!')
		}

		if (minScoreValue === undefined) {
			throw new RangeError('Minimum attribute score value required!')
		}

		if (maxScoreValue === undefined) {
			a
			throw new RangeError('Maximum attribute score value required!')
		}

		if (posX === undefined || posY === undefined) {
			throw new RangeError('Position attributes posX and posY are required!')
		}

		if (health === undefined) {
			throw new RangeError('Character health value required!')
		}

		if (freePoints === undefined) {
			throw new RangeError('Free attribute points value required!')
		}

		// Boolean to check if us/the user has confirmed these to be set correctly
		this.charname = '';
		this.charclass = '';

		this.posX = posX;
		this.posY = posY;
		this.health = health;

		this.attributeClassOptions = characterClassOptions;
		this.defaultAttributeScores = new AttributeScores(attributeScores, minScoreValue, maxScoreValue, freePoints);
		this.attributeScores = new AttributeScores(attributeScores, minScoreValue, maxScoreValue, freePoints);
		// We cannot trust our character details until they are confirmed by the server
		this.detailsConfirmed = false;
	}

	isDetailsConfirmed() {
		return this.detailsConfirmed;
	}

	onceCharacterDetailsConfirmed (onConfirmedCb) {
		// Single-shot mapping for setting of the details to something
		this.once(EVENTS.CONFIRM_DETAILS, onConfirmedCb);
	}

	getAttributeNames () {
		let attribNames = Object.keys(this.getAttributeScores())
		return attribNames
	}

	/**
	 * Do all expected details exist?
	 * @returns {boolean}
	 */
	characterDetailsExist () {
		// TODO String validation
		let nameGood = (this.charname !== undefined && this.charname !== null)
		let attributes = (this.attributeScores !== undefined && this.attributeScores !== null)
		let charclassGood = (this.charclass !== undefined && this.charclass !== null)
		let healthGood = (this.health !== undefined && this.health !== null)

		//TODO Validate Attributes

		return (nameGood && attributes && charclassGood && healthGood)
	};

	getCharacterClassOptions () {
		return this.attributeClassOptions;
	}

	setCharacterClassOptions (characterClassOptions) {
		if (characterClassOptions !== undefined && characterClassOptions !== null && characterClassOptions !== {}) {
			let charClassOptions = CharacterClassOptions.fromOptionsList(characterClassOptions)
			this.attributeClassOptions = charClassOptions
			this.emit(EVENTS.SET_CLASS_OPTIONS, charClassOptions)
			console.info('Character class options set!')
		} else {
			throw new RangeError('Invalid character class options.')
		}
	}

	isCharacterClassOptionsDefined () {
		let charclassOptions = this.getCharacterClassOptions()
		return (charclassOptions !== undefined && charclassOptions.length > 0)
	}

	/**
	 * Checks scores are valid and that all expected default keys are provided
	 * @param JSON score name-value mappings i.e { A:1, B:2 }
	 * @returns {boolean} whether all attributes are valid and recognised
	 */
	validateAttributeScores (scoresJson) {
		if (!this.getDefaultAttributeScores().size > 0) {
			throw new RangeError('Default attribute scores are undefined!')
		}

		scoresJson.validate()

		this.getDefaultAttributeScores().keys().forEach(key => {
			if (!scoresJson.has(key)) {
				throw new RangeError('Missing default attribute score key/value pair: ' + key)
			}
		})

	}

	// Checks for the presence of data for character update
	//	Example JSON
	//{"charname":"roo","pos_x":10,"pos_y":10,"health":100,
	// "charclass":"fighter","free_points":5,
	// "attributeScores": {"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}};
	static validateJson (updateJSON) {
		console.log('CharacterDetails validating: ' + JSON.stringify(updateJSON))
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			let characterDataExists = ValidationHandler.checkDataAttributes(updateJSON, [CHARACTER_JSON_NAME])
			let characterData = updateJSON[CHARACTER_JSON_NAME]
			let positionData = characterData[POSITION_JSON_NAME]
			let coreAttribs = [
				CHARNAME_JSON_NAME,
				POSITION_JSON_NAME,
				HEALTH_JSON_NAME,
				CHARCLASS_JSON_NAME,
				ATTRIBUTES_JSON_NAME
			]

			let positionAttribs = [POSITION_X_JSON_NAME, POSITION_Y_JSON_NAME]

			let coreDataExists = characterDataExists && ValidationHandler.checkDataAttributes(characterData, coreAttribs)
			let positionExists = characterDataExists && ValidationHandler.checkDataAttributes(positionData, positionAttribs)
			let attributesExist = characterDataExists && AttributeScores.validateAttributesJson(characterData)

			if (!characterDataExists) {
				throw new RangeError('\'character\' data not defined')
			}

			if (!coreDataExists) {
				throw new RangeError('Core attributes data not defined, expected: ' + JSON.stringify(coreAttribs))
			}

			if (!positionExists) {
				throw new RangeError('Position data: ' + JSON.stringify(positionData) + ' does not contain expected attribs: ' + positionAttribs)
			}

			if (!attributesExist) {
				throw new RangeError('\'attributes\' data not defined')
			}

			return characterDataExists && coreDataExists && positionExists && attributesExist
		} else {
			throw new RangeError('updateJSON undefined')
		}
	}

	updateAttributeScores (scoresJson) {
		let currentScoresMap = this.getAttributeScores().getScores();

		if (currentScoresMap.length > 0) {
			console.debug('Updating scores: ' + JSON.stringify(scoreAttributes));
			let updatedCount = 0;
			currentScoresMap.keys().forEach(attribName => {
				console.debug('Setting CharacterDetails: ' + attribName + ' ' + scoresJson[attribName])
				this.attributeScores.setScore(attribName, scoresJson[attribName])
				updatedCount++
			});
			console.debug(this.getAttributeScores())
			if (updatedCount > 0) {
				this.emit(EVENTS.SET_ATTRIB_SCORES, this.getAttributeScores())
			} else {
				console.warn('Attribute scores not updated!')
			}
		} else {
			console.log('No existing scores to update!');
			console.trace();
		}
	}

	updateAttributes (attributesJson) {
		let free_points = attributesJson[FREEPOINTS_NAME]
		this.attributeScores.setFreePoints(free_points)
		let scoresJson = attributesJson[SCORES_NAME]
		this.updateAttributeScores(scoresJson)
	}

	setFromJson (characterDetailsJson) {
		if (CharacterDetails.validateJson(characterDetailsJson)) {
			console.debug('Setting CharacterDetails from data: ' + JSON.stringify(characterDetailsJson));
			let characterData = characterDetailsJson[CHARACTER_JSON_NAME];

			let charname = characterData[CHARNAME_JSON_NAME];
			this.setCharacterName(charname);

			let charclass = characterData[CHARCLASS_JSON_NAME];
			this.setCharacterClass(charclass);

			let position = characterData[POSITION_JSON_NAME];
			this.posX = position[POSITION_X_JSON_NAME];
			this.posY = position[POSITION_Y_JSON_NAME];
			this.health = characterData[HEALTH_JSON_NAME];

			// Copy each of the stat attribs over
			this.setAttributesFromJson(characterData);

			this.emit(EVENTS.SET_DETAILS)
			// If this is the first time updating these details, we can confirm their validity
			if (!this.detailsConfirmed) this.emit(EVENTS.CONFIRM_DETAILS);
			return this;
		} else {
			throw new RangeError(INVALID_CHAR_UPDATE_DATA_ERROR + JSON.stringify(characterDetailsJson))
		}

	};

	getCharacterName () {
		return this.charname
	}

	setCharacterName (charname) {
		this.charname = charname
	}

	getCharacterClass () {
		return this.charclass
	}

	setCharacterClass (charclass) {
		this.charclass = charclass
	}

	getPosition () {
		return [this.posX, this.posY];
	}

	getHealth() {
		return this.health;
	}

	/*
	 *
	 * @param attributeScoresJson i.e { A:1, B:2}
	 */
	setAttributeScores (attributeScores) {
		if (attributeScores instanceof AttributeScores) {
			attributeScores.validate()

			let existingDefaults = this.getDefaultAttributeScores();
			let existingDefaultScores = existingDefaults.getScores();

			// Set defaults on first set call
			if (existingDefaultScores.size === 0) {
				this.defaultAttributeScores = AttributeScores.fromJson(attributeScores.getJson())
			}
			this.attributeScores = attributeScores
			this.emit(EVENTS.SET_ATTRIB_SCORES, this.getAttributeScores())
		} else {
			throw new RangeError('Expected an instance of AttributeScores! received: ' + attributeScores)
		}
	}

	/**
	 * Extracts the 'attributes' JSON living underneath the 'character' json data
	 * returns a JSON object with 'attributes' as it's only key
	 */
	extractAttributesJson(characterDetailsJson) {
		let characterJson = ValidationHandler.validateAndGetAttribute(characterDetailsJson, CHARACTER_JSON_NAME);
		let attribsJson = ValidationHandler.validateAndGetAttribute(characterJson, ATTRIBUTES_NAME);
		return { [ATTRIBUTES_NAME] : attribsJson };
	}

	/*
	 * @param attribsJson, json data containing an attributes object keyed by it's name
	 */
	setAttributesFromJson (attribsJson) {
		if (AttributeScores.validateAttributesJson(attribsJson)) {
			this.setAttributeScores(AttributeScores.fromJson(attribsJson));
		}
	}


	getDefaultAttributeScores () {
		return this.defaultAttributeScores
	}

	getAttributeScores () {
		return this.attributeScores
	}

	//	Grabs Character Name, Class, and Attribute values
	getJson () {
		return {
			'character': {
				'charname': this.charname,
				'charclass': this.charclass,
				'position': {
					'pos_x': this.posX,
					'pos_y': this.posY
				},
				'health': this.health,
				'attributes': this.attributeScores.getJson()['attributes']
			}
		}
	}

	static isValidCharacterUpdateData (updateJSON) {
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			return ValidationHandler.checkDataAttributes(updateJSON, CHARACTER_UPDATE_ATTRIBS)
			//if (bodyValid) {
			//let contentValid = CharacterDetails.validateJson(updateJSON);
			//}
		}

		return false
	}

}

export { CharacterDetails }