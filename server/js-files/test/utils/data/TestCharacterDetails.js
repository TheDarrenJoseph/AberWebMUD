// JSON to match the CharacterDetails below
import { MIN_VALUE_NAME, MAX_VALUE_NAME, FREEPOINTS_NAME, SCORES_NAME  } from 'src/model/page/AttributeScores.js'
import { CharacterDetails } from 'src/model/page/CharacterDetails.js'
import { CharacterDetailsBuilder } from 'src/model/page/CharacterDetailsBuilder.js'
import { CharacterClassOptions } from 'src/model/page/CharacterClassOptions.js'
import { AttributeScores } from 'src/model/page/AttributeScores.js'

export const TEST_CHARNAME = 'Woody';
export const TEST_CHARCLASSOPTIONS = ['Fighter', 'Spellcaster'];
export const TEST_CHARCLASS = 'Spellcaster';
export const TEST_FREEPOINTS = 5;
export const TEST_HEALTH = 100;

// Fortitude, Intellect, Awareness, Arcana, Agility
export const TEST_SCORES = {'Strength':1, 'Agility':1, 'Arcana' : 1, 'Stealth': 1};
export const TEST_ATTRIBUTESCORES = {
	[MIN_VALUE_NAME] : 0,
	[MAX_VALUE_NAME] : 100,
	[FREEPOINTS_NAME]: 5,
	[SCORES_NAME]: TEST_SCORES
}

export const TEST_POSITION = {
	'pos_x': 4,
	'pos_y': 4
}

export const TEST_CHARDATA = {
	'character' : {
		'charname': TEST_CHARNAME,
		'position': TEST_POSITION,
		'health': TEST_HEALTH,
		'charclass': TEST_CHARCLASS,
		'attributes': TEST_ATTRIBUTESCORES
	}
};

export const TEST_CHARCLASS_OPTIONS = CharacterClassOptions.fromOptionsList(TEST_CHARCLASSOPTIONS)

// Example HTTP JSON responses for character details options
export const TEST_ATTRIBUTES_RESPONSE = { 'attributes': TEST_ATTRIBUTESCORES };
export const TEST_CHARACTER_CLASS_OPTIONS = {'options' : TEST_CHARCLASSOPTIONS };

export const TEST_ATTRIBUTE_SCORES = AttributeScores.fromJson(TEST_ATTRIBUTES_RESPONSE);

export const DEFAULT_CHARDETAILS = new CharacterDetailsBuilder().withDefaults().build();

// Perform the update of the underlying model
export var testCharacterDetails = new CharacterDetailsBuilder().withDefaults()
.withFreePoints(TEST_FREEPOINTS)
.withScoreBoundaries(TEST_ATTRIBUTE_SCORES.getMinimumAttributeValue(), TEST_ATTRIBUTE_SCORES.getMaximumAttributeValue())
.withPosition(0,0)
.withAttributeScores(TEST_SCORES)
.withCharacterName(TEST_CHARNAME)
.withCharacterClassOptions(TEST_CHARCLASS_OPTIONS)
.withCharacterClass(TEST_CHARCLASS)
.build();

