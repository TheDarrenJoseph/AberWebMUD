from pyfiles.model import mapTile
from pyfiles.db import position

# Shared size constants
min_size_x = 1
min_size_y = 1
max_size_x = 100
max_size_y = 100

# A literal tile map model
class Map:
    map_size_x = 20
    map_size_y = 20
    map_tiles = []

def is_traversible(self, x : int, y : int) -> bool:
    """ Checks both map bounds and traversibility for a given co-ord """
    if (x >= 0 and y >= 0 and x <= self.map_size_x-1 and y <= self.map_size_y-1):
        if self.map_tiles[x][y] is not None:
            return self.map_tiles[x][y].traversible
    else:
        return False

# Verifies that the size inputs are valid, if so uses them
def assign_size(self, size_x, size_y):
    if (size_x > min_size_x and size_x < max_size_x):
        self.map_size_x = size_x
    if (size_y > min_size_y and size_y < max_size_y):
        self.map_size_t = size_y

def create_map(self, map_size_x, map_size_y) -> None:

    # validate/update map size
    assign_size(map_size_x, map_size_y)

    for x in range(self.map_size_x):
        self.map_tiles.append([]) #Appending a new list to allow indexing
        for y in range(map_size_y):
            self.map_tiles[x].append([])

            # Create a new default tile
            map_tile = mapTile.MapTile()

            #Adding a random barrier tile for testing the map
            if x == 5 and y == 5:
                map_tile = mapTile.MapTile(1, False)

            self.map_tiles[x][y] = map_tile

def __init__(self, map_size_x, map_size_y):
    create_map(self, map_size_x, map_size_y)
