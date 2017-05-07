#This will eventually be some form of map object loaded in from a database
#Just using simple test values for now
from pyfiles.model import mapTile
from pyfiles.db import position

map_size_x = 20
map_size_y = 20
map_tiles = []

def is_traversible(x : int, y : int) -> bool:
    """ Checks both map bounds and traversibility for a given co-ord """
    if (x>=0 and y>=0 and x<=map_size_x-1 and y<=map_size_y-1):
        if map_tiles[x][y] is not None:
            return map_tiles[x][y].traversible
    else:
        return False

#Returns the starting position for all characters on the map
def get_starting_pos() -> (int,int):
    _START_POS = (int(map_size_x/2),int(map_size_y/2)) #X,Y tuple of map midpoint
    _START_POS = position.Position(pos_x=_START_POS [0], pos_y=_START_POS[1])
    return _START_POS  #Return an X,Y tuple

def create_map() -> None:
    if not map_tiles:
        for x in range(map_size_x):
            map_tiles.append([]) #Appending a new list to allow indexing
            for y in range(map_size_y):
                map_tiles[x].append([])
                map_tile = mapTile.MapTile() #Default tile

                #Adding a random barrier tile for testing the map
                if x == 5 and y == 5:
                    map_tile = mapTile.MapTile(1, False)
                map_tiles[x][y] = map_tile
