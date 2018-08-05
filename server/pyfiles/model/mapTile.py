# Data model for tiles read in from json resource atlasses
class MapTile():

    tileType = None
    tileName = None
    traversible = None

    def __init__(self, tile_type=0, tile_name=None, traversible=True):
        self.tileType = tile_type
        #Unique ID string for the tile
        self.tileName   = tile_name
        self.traversible = traversible
