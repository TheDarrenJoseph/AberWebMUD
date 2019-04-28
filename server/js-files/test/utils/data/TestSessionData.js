import { CLASS_OPTIONS } from 'src/model/page/CharacterDetails.js';

// Default human attributes w/ 27 free points
export var TEST_SESSIONID = 12345678;

// Fortitude, Intellect, Awareness, Arcana, Agility
export var TEST_SCORES = {'FOR':8, 'INT':8, 'AWR' : 8, 'ARC': 8 , 'AGL' : 8};
export var TEST_CHARDATA = {
	'charname': 'FooBar',
	'charclass': 'spellcaster', //Non-default charclass
	'pos_x': 4,
	'pos_y': 4,
	'health': 100,
	'free_points': 27,
	'attributes': TEST_SCORES,
};

export var TEST_CHARUPDATE_DATA = {'success': true, 'username': 'foo', 'char-data' : TEST_CHARDATA, 'sessionId' : TEST_SESSIONID };