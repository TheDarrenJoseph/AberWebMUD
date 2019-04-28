import ValidationHandler from 'src/handler/ValidationHandler.js';

import { EventMapping } from 'src/helper/EventMapping.js';
import jquery from 'jquery'

export var CHARACTER_UPDATE_ATTRIBS = ['success','username','char-data','sessionId'];
export var CHARACTER_DATA_ATTRIBS = ['charname', 'pos_x','pos_y', 'health', 'charclass', 'free_points', 'attributes'];

//	2 arrays of the same length to allow looping for creating each line of the table
// Fortitude, Intellect, Awareness, Arcana, Agility
export const DEFAULT_ATTRIBUTES = {'FOR':1, 'INT': 1, 'AWR' : 1, 'ARC': 1 , 'AGL' : 1};
export const ATTRIB_NAMES = Object.keys(DEFAULT_ATTRIBUTES);
export const ATTRIB_INPUT_IDS = ['forNumber', 'intNumber', 'awrNumber', 'arcNumber', 'aglNumber'];
export const MIN_ATTRIB_VAL = 1;
export const MAX_ATTRIB_VAL = 100;
export const DEFAULT_FREE_POINTS = 9;

export const EVENTS = { SET_DETAILS : 'set-details', SET_ATTRIBS : 'set-attributes' };

const INVALID_CHAR_UPDATE_DATA_ERROR = 'Character update data is invalid: ';

// this might be a little messy
// but we want to be able to store a simple ID and the Option display text
// While still allowing indexing from option number
export var CLASS_OPTIONS = [
	{ id: 'fighter', text : 'Fighter'},
	{ id: 'spellcaster', text : 'Spellcaster'}
];

export const DEFAULT_JSON = {
	'charname' : '',
	'charclass' : CLASS_OPTIONS[0],
	// TODO make this name attributes through the stack
	'attributes' : DEFAULT_ATTRIBUTES,
	'pos_x' : 0,
	'pos_y' : 0,
	'health' : MAX_ATTRIB_VAL,
	'free_points': DEFAULT_FREE_POINTS
};

export default class CharacterDetails extends EventMapping {
	constructor (charname="", grid_x=0, grid_y=0) {
			super();
			// Boolean to check if us/the user has confirmed these to be set correctly
			this.charname = charname;
			this.charclass = CLASS_OPTIONS[0];

			this.attributes = DEFAULT_ATTRIBUTES;

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
		let attributes = (this.attributes !== undefined && this.attributes !== null);
		let charclassGood = (this.charclass !== undefined && this.charclass !== null);
		let healthGood = (this.health !== undefined && this.health !== null);

		return (nameGood && attributes && charclassGood && healthGood);
	};

	/**
	 * Validates character stats (STR, DEX, CON, etc)
	 * @param charStats JSON e.g { A : 1, B : 2}
	 * @returns {boolean}
	 */
	static isValidStats(charStats) {
		let valid = false;

		if (charStats !== undefined) {

			let attribCount = Object.keys(charStats).length;
			if (attribCount > 0) {
				let validAttribCount = 0;
				Object.keys(DEFAULT_ATTRIBUTES).forEach(attribName => {
					let theAttrib = charStats[attribName];
					let attribDefined = theAttrib != undefined && theAttrib != null;
					let attribValid = (theAttrib >= MIN_ATTRIB_VAL && theAttrib <= MAX_ATTRIB_VAL);

					// Definitely log invalid values
					if (attribDefined && !attribValid) {
						console.log('Char Stats: ' + charStats + ' value for attribute invalid: ' + attribName);
						return false;
					} else if (!attribDefined || !attribValid) {
						console.log('Char Stats: ' + charStats + ' attribute or value invalid: ' + attribName + ' : ' + theAttrib);
						return false;
					} else {
						validAttribCount++;
					}

				});

				// Check we validated each attrib
				valid = (validAttribCount === attribCount);
			}
		}

		return valid;
	}


	// Checks for the presence of data for character update
	//	Example JSON
	//{"charname":"roo","pos_x":10,"pos_y":10,"health":100,
	// "charclass":"fighter","free_points":5,
	// "attributes": {"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}};
	static isValidCharacterData (updateJSON) {
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			let coreDataExists = ValidationHandler.checkDataAttributes(updateJSON, ['free_points','attributes']);
			let statsExist = CharacterDetails.isValidStats(updateJSON['attributes']);
			return coreDataExists && statsExist;
		} else {
			console.log('Missing character update data.');
			return false;
		}
	}

	setCharacterDetails (data) {
		if (CharacterDetails.isValidCharacterData(data)) {
			this.charname = data['charname'];
			this.charclass = data['charclass'];
			this.pos_x = data['pos_x'];
			this.pos_y = data['pos_y'];
			this.health = data['health'];
			this.free_points = data['free_points'];

			// Copy each of the stat attribs over
			let attributes = data['attributes'];
			Object.keys(DEFAULT_ATTRIBUTES).forEach( attribName => {
				this.attributes[attribName] = attributes[attribName];
			});

			this.emit(EVENTS.SET_DETAILS);
		} else {
			throw new RangeError(INVALID_CHAR_UPDATE_DATA_ERROR + JSON.stringify(data));
		}

	};

	getAttributes () {
		return this.attributes;
	}

	setAttributes(charStats) {
		if (CharacterDetails.isValidStats(charStats) ) {
			this.attributes = charStats;
			this.emit(EVENTS.SET_ATTRIBS, this.attributes);
		}
	}

	//	Grabs Character Name, Class, and Attribute values
	getCharacterDetailsJson () {
		return {
			'charname': this.charname,
			'charclass': this.charclass,
			'pos_x' : this.pos_x,
			'pos_y' : this.pos_y,
			'health' : this.health,
			'free_points' : this.free_points,
			'attributes': this.attributes
		};
	}

	static isValidCharacterUpdateData (updateJSON) {
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			let bodyValid = ValidationHandler.checkDataAttributes(updateJSON,
			CHARACTER_UPDATE_ATTRIBS);
			if (bodyValid) {
				let contentValid = CharacterDetails.isValidCharacterData(updateJSON['char-data']);
				return bodyValid && contentValid;
			}
		}

		return false;
	}

}

export { CharacterDetails };