import unittest
from pyfiles.db import attributes
from pyfiles.db.attributes import ATTRIBUTE_NAMES

class TestAttributes(unittest.TestCase):

    def test_get_json_attribute_score_options(self):
        json_options = attributes.Attributes.get_json_attribute_score_options()
        self.assertEqual(json_options, {'options': ATTRIBUTE_NAMES})