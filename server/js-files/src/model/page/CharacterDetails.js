import ValidationHandler from 'src/handler/ValidationHandler.js';

import { EventMapping } from 'src/helper/EventMapping.js';

export var CHARACTER_UPDATE_ATTRIBS = ['success','username','char-data','sessionId'];
export var CHARACTER_DATA_ATTRIBS = ['charname', 'pos_x','pos_y', 'health', 'charclass', 'free_points', 'scores'];

//	2 arrays of the same length to allow looping for creating each line of the table
// Fortitude, Intellect, Awareness, Arcana, Agility
export const DEFAULT_STATS = {'FOR':1, 'INT': 1, 'AWR' : 1, 'ARC': 1 , 'AGL' : 1};
export const ATTRIB_NAMES = Object.keys(DEFAULT_STATS);
export const ATTRIB_INPUT_IDS = ['forNumber', 'intNumber', 'awrNumber', 'arcNumber', 'aglNumber'];
export const MIN_ATTRIB_VAL = 1;
export const MAX_ATTRIB_VAL = 100;
export const DEFAULT_FREE_POINTS = 9;

export const EVENTS = { SET_STATS : 'set-stats', REQUEST_DETAILS : 'request-details', DETAILS_CONFIRMED: 'details-confirmed'};

const INVALID_CHAR_UPDATE_DATA_ERROR = 'Character update data is invalid: ';


// this might be a little messy
// but we want to be able to store a simple ID and the Option display text
// While still allowing indexing from option number
export var CLASS_OPTIONS = [
	{ id: 'fighter', text : 'Fighter'},
	{ id: 'spellcaster', text : 'Spellcaster'}
];

export default class CharacterDetails extends EventMapping {
	constructor (charname="", grid_x=0, grid_y=0) {
			super();
			// Boolean to check if us/the user has confirmed these to be set correctly
			this.confirmed = false;
			this.charname = charname;
			this.characterStats = DEFAULT_STATS;
			this.charclass = CLASS_OPTIONS[0];
			this.pos_x = grid_x;
			this.pox_y = grid_y;

			this.health = MAX_ATTRIB_VAL;
			this.free_points = DEFAULT_FREE_POINTS;
	}

	/**
	 * Do all expected details exist?
	 * @returns {boolean}
	 */
	characterDetailsExist () {
		let confirmed = this.confirmed;
		let nameGood = (this.charname !== undefined && this.charname !== null);
		let characterStats = (this.characterStats !== undefined && this.characterStats !== null);
		let charclassGood = (this.charclass !== undefined && this.charclass !== null);
		let healthGood = (this.health !== undefined && this.health !== null);

		return (confirmed && nameGood && characterStats && charclassGood && healthGood);
	};

	/**
	 * Validates character stats (STR, DEX, CON, etc)
	 * @param charStats
	 * @returns {boolean}
	 */
	static isValidStats(charStats) {
		let failed = false;

		if (charStats !== undefined) {
			Object.keys(DEFAULT_STATS).forEach( attribName => {
				let theAttrib = charStats[attribName];
				let attribDefined = theAttrib != undefined && theAttrib != null;
				let attribValid = (theAttrib >= MIN_ATTRIB_VAL && theAttrib <= MAX_ATTRIB_VAL);

				// Definitely log invalid values
				if (attribDefined && !attribValid) {
					console.log('Char Stats: ' + charStats + ' value for attribute invalid: ' + attribName);
					failed = true;
				} else {
					// console.log('Char Stats: ' + charStats + ' missing an attribute value for: ' + attribName);
					failed = true;
				}

			});
		}

		return failed;
	}


	// Checks for the presence of data for character update
	//	Example JSON
	//{"charname":"roo","pos_x":10,"pos_y":10,"health":100,
	// "charclass":"fighter","free_points":5,
	// "scores": {"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}};
	static isValidCharacterData (updateJSON) {
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			let coreDataExists = ValidationHandler.checkDataAttributes(updateJSON, updateJSON['free_points','scores']);
			let statsExist = CharacterDetails.isValidStats(updateJSON['scores']);
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
			let scores = data['scores'];
			for (let statName in Object.keys(DEFAULT_STATS)){
				this.characterStats.statName = scores[statName];
			}

			this.confirmed = true;
			this.emit(EVENTS.DETAILS_CONFIRMED);

		} else {
			throw new RangeError(INVALID_CHAR_UPDATE_DATA_ERROR + JSON.stringify(data));
		}

	};

	setStatsAttributeValues(charStats) {
		if (CharacterDetails.isValidStats(charStats) ) {
			this.characterStats = charStats;
			this.emit(EVENTS.SET_STATS, this.characterStats);
		}
	}

	//	Checks that the player's character details are set
	//	and asks them to set them if false
	/**
	 *
	 */
	checkCharacterDetails () {

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