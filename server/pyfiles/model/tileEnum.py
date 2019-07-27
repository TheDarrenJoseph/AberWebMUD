from enum import Enum, unique
from pyfiles.model import mapTile

@unique
class TileEnum(Enum):
    grass_plain = mapTile.MapTile(0, 'grass-plain', True)
    grass_bush = mapTile.MapTile(1, 'grass-bush', False)

    def to_json(self):
        return {'code': self.value.tileType, 'tile-name' : self.value.tileName}