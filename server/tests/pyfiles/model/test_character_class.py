import unittest
from pyfiles.model import characterClass


class TestCharacterClass(unittest.TestCase):
    def test_get_json_options(self):
        json_options = characterClass.CharacterClass.get_json_options()
        self.assertEqual(json_options, {'options': ['Fighter', 'Spellcaster', 'Rogue']})
