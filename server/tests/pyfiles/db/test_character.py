import unittest, logging, copy
from pyfiles import characterController, playerController
from pyfiles.model import characterClass

from pony.orm import db_session

TEST_SESSIONID = 12345678
TEST_USERNAME = 'foo'
TEST_CHARNAME = 'Woody'
TEST_CHARCLASS = characterClass.CharacterClass.Fighter

DEFAULT_SCORES = {'Strength': 0, 'Agility': 0, 'Arcana': 0, 'Stealth': 0}

DEFAULT_CHARACTER_DETAILS = {
    'character' : {
        'charname': TEST_CHARNAME,
        'charclass': TEST_CHARCLASS.value,
        'position': {
            'pos_x': 11,
            'pos_y': 11
        },
        'health': 100,
        'attributes': {
            'free_points': 5,
            'scores': DEFAULT_SCORES
        }
    }
}


TEST_SCORES = {'Strength': 2, 'Agility': 2, 'Arcana': 2, 'Stealth': 2}

TEST_CHARACTER_DETAILS = {
    'character' : {
        'charname': TEST_CHARNAME,
        'charclass': TEST_CHARCLASS.value,
        'position': {
            'pos_x': 0,
            'pos_y': 0
        },
        'health': 100,
        'attributes': {
            'free_points': 5,
            'scores': TEST_SCORES
        }
    }
}

TEST_SESSION_INFO_JSON = { 'sessionId' : TEST_SESSIONID,
                           'username' : TEST_USERNAME}

TEST_CHARUPDATE_DATA = {
    'character' : TEST_CHARACTER_DETAILS['character'],
    'sessionJson' : TEST_SESSION_INFO_JSON
}

TEST_PLAYER = None

class TestCharacter(unittest.TestCase):
    exception_response = None

    @classmethod
    def setUp(self) -> None:
        TEST_PLAYER = playerController.new_player(TEST_USERNAME, 'test')
        logging.info('Test player created: ' + str(TEST_PLAYER))

    @classmethod
    def tearDown(self) -> None:
        playerController.remove_player(TEST_USERNAME)

    def test_get_json(self):
        self.maxDiff = None
        test_character = characterController.new_character(TEST_CHARNAME, 'foo')
        self.assertNotEqual(test_character, None, 'Check the character was created.')
        character_json = test_character.get_json()
        self.assertEqual(character_json, DEFAULT_CHARACTER_DETAILS, 'Ensure the character JSON representation is as expected')

    def test_update_from_json(self):
        self.maxDiff = None
        # character creation creates a db_session, we must have a top-level session to avoid losing it
        with db_session:
            test_character = characterController.new_character(TEST_CHARNAME, TEST_USERNAME)
            self.assertNotEqual(test_character, None, 'Check the character was created.')
            character_json = test_character.get_json()
            self.assertEqual(character_json, DEFAULT_CHARACTER_DETAILS, 'Ensure the character JSON representation is as expected')

            updated_details = copy.deepcopy(TEST_CHARACTER_DETAILS)
            updated_details['character']['charclass'] = 'Spellcaster'
            print('original chardetails ' + str(TEST_CHARACTER_DETAILS))
            self.assertTrue(test_character.update_from_json(updated_details), 'Try to perform character update')
            character_json = test_character.get_json()
            print('Expected: ' + str(updated_details))
            print('Actual' + str(character_json))
            self.assertEqual(character_json, updated_details, 'Ensure the character JSON representation is as expected')
