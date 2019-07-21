import { CLASS_OPTIONS } from 'src/model/page/CharacterDetails.js';

// Default human attributeScores w/ 27 free points
export const TEST_SESSIONID = 12345678;

// Fortitude, Intellect, Awareness, Arcana, Agility
export const TEST_SCORES = {'FOR':8, 'INT':8, 'AWR' : 8, 'ARC': 8 , 'AGL' : 8};
export const TEST_CHARDATA = {
	'character' : {
		'charname': 'FooBar',
		'position' : {
			'pos_x': 4,
			'pos_y': 4
		},
		'health': 100,
		'charclass': 'spellcaster',
		'attributes': {
			'free_points': 27,
			'scores': TEST_SCORES
		}
	}
};

// For the 'character-details-update' event response
export const TEST_CHARUPDATE_DATA = {'success': true, 'username': 'foo', 'character' : TEST_CHARDATA['character'], 'sessionId' : TEST_SESSIONID };