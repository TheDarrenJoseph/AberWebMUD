import ValidationHandler from 'src/handler/ValidationHandler.js';

import { EventMapping } from 'src/helper/EventMapping.js';
import jquery from 'jquery'

export var CHARACTER_UPDATE_ATTRIBS = ['success','character'];
export var CHARACTER_DATA_ATTRIBS = ['charname', 'pos_x','pos_y', 'health', 'charclass', 'free_points', 'attributes'];

//	2 arrays of the same length to allow looping for creating each line of the table
// Fortitude, Intellect, Awareness, Arcana, Agility
export const DEFAULT_ATTRIBUTES = {'FOR':1, 'INT': 1, 'AWR' : 1, 'ARC': 1 , 'AGL' : 1};
export const ATTRIB_NAMES = Object.keys(DEFAULT_ATTRIBUTES);
export const ATTRIB_INPUT_IDS = ['forNumber', 'intNumber', 'awrNumber', 'arcNumber', 'aglNumber'];
export const MIN_ATTRIB_VAL = 1;
export const MAX_ATTRIB_VAL = 100;
export const DEFAULT_FREE_POINTS = 9;

export const EVENTS = { SET_DETAILS : 'set-details', SET_ATTRIBS : 'set-attributeScores' };

const INVALID_CHAR_UPDATE_DATA_ERROR = 'Character update data is invalid: ';

// this might be a little messy
// but we want to be able to store a simple ID and the Option display text
// While still allowing indexing from option number
export var CLASS_OPTIONS = [
	{ id: 'fighter', text : 'Fighter'},
	{ id: 'spellcaster', text : 'Spellcaster'}
];

export const DEFAULT_JSON = {
	'character' : {
		'charname': '',
		'charclass': CLASS_OPTIONS[0],
		'health': MAX_ATTRIB_VAL,
		'attributes': {
			'free_points': DEFAULT_FREE_POINTS,
			'scores': DEFAULT_ATTRIBUTES
		},
		'position': {
			'pos_x': 0,
			'pos_y': 0
		}
	}
};

export default class CharacterDetails extends EventMapping {
	constructor (charname="", grid_x=0, grid_y=0) {
			super(EVENTS);
			// Boolean to check if us/the user has confirmed these to be set correctly
			this.charname = charname;
			this.charclass = CLASS_OPTIONS[0];

			this.attributeScores = DEFAULT_ATTRIBUTES;

			this.pos_x = grid_x;
			this.pos_y = grid_y;
			this.health = MAX_ATTRIB_VAL;
			this.free_points = DEFAULT_FREE_POINTS;
	}

	/**
	 * Do all expected details exist?
	 * @returns {boolean}
	 */
	characterDetailsExist () {
		let nameGood = (this.charname !== undefined && this.charname !== null);
		let attributes = (this.attributeScores !== undefined && this.attributeScores !== null);
		let charclassGood = (this.charclass !== undefined && this.charclass !== null);
		let healthGood = (this.health !== undefined && this.health !== null);

		return (nameGood && attributes && charclassGood && healthGood);
	};

	/**
	 * Validates character stats (STR, DEX, CON, etc)
	 * @param attribJson JSON e.g { A : 1, B : 2}
	 * @returns {boolean}
	 */
	static isValidAttributes(attribJson) {
		let valid = false;

		if (attribJson !== undefined) {

			let containsFreePoints = attribJson.hasOwnProperty('free_points');
			let containsScores= attribJson.hasOwnProperty('scores');

			if (containsFreePoints && containsScores) {
				let scores = attribJson['scores'];

				let attribCount = Object.keys(scores).length;
				if (attribCount > 0) {
					let validAttribCount = 0;
					Object.keys(DEFAULT_ATTRIBUTES).forEach(attribName => {
						let theAttrib = scores[attribName];
						let attribDefined = theAttrib != undefined && theAttrib != null;
						let attribValid = (theAttrib >= MIN_ATTRIB_VAL && theAttrib <= MAX_ATTRIB_VAL);

						// Definitely log invalid values
						if (attribDefined && !attribValid) {
							console.log('Char Stats: ' + scores + ' value for attribute invalid: ' + attribName);
							return false;
						} else if (!attribDefined || !attribValid) {
							console.log('Char Stats: ' + scores + ' attribute or value invalid: ' + attribName + ' : ' + theAttrib);
							return false;
						} else {
							validAttribCount++;
						}

					});

					// Check we validated each attrib
					valid = (validAttribCount === attribCount);
				}

			} else {
				console.error('Character Attributes missing \'free_points\' and/or \'scores\' attributeScores')
			}
		}

		return valid;
	}


	// Checks for the presence of data for character update
	//	Example JSON
	//{"charname":"roo","pos_x":10,"pos_y":10,"health":100,
	// "charclass":"fighter","free_points":5,
	// "attributeScores": {"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}};
	static isValidCharacterData (updateJSON) {
		if (ValidationHandler.notUndefOrNull(updateJSON)) {

			let characterDataExists = ValidationHandler.checkDataAttributes(updateJSON, ['character']);
			let characterData = updateJSON['character'];

			let coreDataExists = ValidationHandler.checkDataAttributes(characterData, [
			  'charname',
				'position',
				'health',
				'charclass',
				'attributes'
			]);

			let positionExists = 	ValidationHandler.checkDataAttributes(characterData['position'], ['pos_x', 'pos_y']);
			let attributesExist = CharacterDetails.isValidAttributes(characterData['attributes']);
			return characterDataExists && coreDataExists && positionExists && attributesExist;
		} else {
			console.log('Missing character update data.');
			return false;
		}
	}

	setCharacterDetails (data) {
		if (CharacterDetails.isValidCharacterData(data)) {
			let characterData = data['character'];

			this.charname = characterData['charname'];

			let position = characterData['position'];
			this.pos_x = position['pos_x'];
			this.pos_y = position['pos_y'];

			this.health = characterData['health'];
			this.charclass = characterData['charclass'];


			// Copy each of the stat attribs over

			if (characterData.hasOwnProperty('attributes')) {
				let attributes = characterData['attributes'];

				let free_points = attributes['free_points'];
				this.free_points = free_points;
				let scores = attributes['scores'];
				Object.keys(DEFAULT_ATTRIBUTES).forEach(attribName => {
					this.attributeScores[attribName] = scores[attribName];
				});
			}

			this.emit(EVENTS.SET_DETAILS);
		} else {
			throw new RangeError(INVALID_CHAR_UPDATE_DATA_ERROR + JSON.stringify(data));
		}

	};

	getAttributes () {
		return this.attributeScores;
	}

	setAttributes(charStats) {
		if (CharacterDetails.isValidAttributes(charStats) ) {
			this.attributeScores = charStats;
			this.emit(EVENTS.SET_ATTRIBS, this.attributeScores);
		}
	}

	//	Grabs Character Name, Class, and Attribute values
	getCharacterDetailsJson () {
		return {
			'character' : {
				'charname': this.charname,
				'charclass': this.charclass,
				'position': {
					'pos_x': this.pos_x,
					'pos_y': this.pos_y
				},
				'health': this.health,
				'attributes': {
					'free_points': this.free_points,
					'scores': this.attributeScores
				}
			}
		};
	}

	static isValidCharacterUpdateData (updateJSON) {
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			let bodyValid = ValidationHandler.checkDataAttributes(updateJSON, CHARACTER_UPDATE_ATTRIBS);
			if (bodyValid) {
				let contentValid = CharacterDetails.isValidCharacterData(updateJSON);
				return bodyValid && contentValid;
			}
		}

		return false;
	}

}

export { CharacterDetails };