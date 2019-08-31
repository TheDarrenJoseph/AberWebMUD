import unittest
from pyfiles.model import characterClass

EXPECTED_VALUES = ['Fighter', 'Spellcaster', 'Rogue']

class TestCharacterClass(unittest.TestCase):

    def test_get_values(self):
        values = characterClass.CharacterClass.get_values()
        self.assertEqual(values, EXPECTED_VALUES)

    def test_get_json_options(self):
        json_options = characterClass.CharacterClass.get_json_options()
        self.assertEqual(json_options, {'options':EXPECTED_VALUES})
