import unittest
from pyfiles.model import map, tileEnum


class TestMap(unittest.TestCase):

    # GIVEN that I have created a new Map model
    # When I examine the newly created instance
    # Then it should be initialised using tileEnum and the values be retrievable
    def test_map_creation_defaults(self):
        this_map = map.Map()
        self.assertEqual(20, this_map.map_size_x)
        self.assertEqual(20, this_map.map_size_y)
        self.assertEqual(20, len(this_map.map_tiles))
        self.assertEqual(this_map.map_size_y, len(this_map.map_tiles[19]))
        first_tile = this_map.map_tiles[0][0]
        self.assertEqual(first_tile, tileEnum.TileEnum.grass_plain)
        self.assertEqual(first_tile.to_json(), {'code': 0, 'tile-name': 'grass-plain'})

    # Checking enums work okay here
    # GIVEN I have created a new map instance
    # When I adjust the TileEnum of a tile
    # Then I expect this to persist
    def test_map_tile_adjustment(self):
        # GIVEN
        this_map = map.Map()
        self.assertEqual(20, len(this_map.map_tiles))
        self.assertEqual(20, len(this_map.map_tiles[19]))
        first_tile = this_map.map_tiles[0][0]
        self.assertEqual(first_tile, tileEnum.TileEnum.grass_plain)
        self.assertEqual(first_tile.to_json(), {'code': 0, 'tile-name': 'grass-plain'})

        # WHEN
        this_map.map_tiles[0][0] = tileEnum.TileEnum.grass_bush
        first_tile = this_map.map_tiles[0][0]

        # THEN
        self.assertEqual(first_tile, tileEnum.TileEnum.grass_bush)
        self.assertEqual(first_tile.to_json(), {'code': 1, 'tile-name': 'grass-bush'})

if __name__ == '__main__':
    unittest.main()
