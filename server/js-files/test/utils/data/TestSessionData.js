import { CLASS_OPTIONS } from 'src/model/page/CharacterDetails.js';

import { MIN_VALUE_NAME, MAX_VALUE_NAME, FREEPOINTS_NAME, SCORES_NAME } from 'src/model/page/AttributeScores.js';
import { TEST_CHARDATA } from 'test/utils/data/TestCharacterDetails.js'

// Default human attributeScores w/ 27 free points
export const TEST_SESSIONID = '12345678';
export const TEST_USERNAME = 'foo';

// For the 'character-details-update' event response
export const TEST_CHARUPDATE_DATA = {'success': true, 'username': 'foo', 'character' : TEST_CHARDATA['character'], 'sessionId' : TEST_SESSIONID };

