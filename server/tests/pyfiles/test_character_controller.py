import unittest
import logging
from pony.orm import db_session
from pyfiles import characterController, playerController
from pyfiles.db import attributes

TEST_SESSIONID = 12345678
TEST_USERNAME = 'foo'
TEST_CHARNAME = 'Woody'
TEST_CHARCLASS = 'Fighter'

TEST_SCORES = {'Strength': 2, 'Agility': 2, 'Arcana': 2, 'Stealth': 2}

TEST_CHARACTER_DETAILS = {
    'character' : {
        'charname': TEST_CHARNAME,
        'charclass': TEST_CHARCLASS,
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


class TestCharacterControllerGood(unittest.TestCase):
    exception_response = None

    def setUpClass():
        TEST_PLAYER = playerController.new_player(TEST_USERNAME, 'test')
        logging.info('Test player created: ' + str(TEST_PLAYER))

    def test_update_character_details(self):
        logging.info('Testing character details update..')

        update_success = characterController.update_character_details(TEST_CHARUPDATE_DATA)
        self.assertTrue(update_success, 'Expected chararacter details update success!')
        with db_session:
            character = characterController.find_character(TEST_CHARNAME)

            charname = character.get_charname()
            charclass = character.get_charclass()
            character_attribs = character.get_attributes()

            self.assertEqual(charname, TEST_CHARNAME, 'Check character charname')
            self.assertEqual(charclass, TEST_CHARCLASS, 'Check character class')

            for attributeName in attributes.ATTRIBUTE_NAMES:
                    attrib = character_attribs.get_attribute(attributeName)
                    self.assertEqual(attrib.value, 2, 'Check attribute name: ' + attributeName + ' is set as expected.')


if __name__ == "__main__":
    unittest.main()
