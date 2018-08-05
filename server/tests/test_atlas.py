import unittest
import sys
import os.path
from pyfiles import dice

# Tests for loading / map creation from JSON atlasses (same as those that define the gfx resources)

_TEST_ATLAS_PATH = "resource/example-tile-atlas.json"

class atlasLoading(unittest.TestCase):

    tiles []

    def load_atlas(self):
        # open file
        testAtlas = open(_TEST_ATLAS_PATH)

        #json.loads(file)
        json.loads(testAtlas)
