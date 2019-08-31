import { CLASS_OPTIONS } from 'src/model/page/CharacterDetails.js';

import { JSON_ATTRIBUTE_MIN_VALUE_NAME, JSON_ATTRIBUTE_MAX_VALUE_NAME, JSON_ATTRIBUTE_FREEPOINTS_NAME, JSON_ATTRIBUTE_SCORES_NAME } from 'src/model/page/AttributeScores.js';
import { TEST_CHARDATA } from 'test/utils/data/TestCharacterDetails.js'

// Default human attributeScores w/ 27 free points
export const TEST_SESSIONID = '12345678';

// For the 'character-details-update' event response
export const TEST_CHARUPDATE_DATA = {'success': true, 'username': 'foo', 'character' : TEST_CHARDATA, 'sessionId' : TEST_SESSIONID };

