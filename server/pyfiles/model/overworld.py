#This will eventually be some form of map object loaded in from a database
#Just using simple test values for now
from pyfiles.model import mapTile

map_size_x = 20
map_size_y = 20
map_tiles = []

#Returns the starting position for all characters on the map
def get_starting_pos():
    return (int(map_size_x/2),int(map_size_y/2)) #Return an X,Y tuple

def create_map():
    if not map_tiles:
        for x in range(map_size_x):
            map_tiles.append([]) #Appending a new list to allow indexing
            for y in range(map_size_y):
                map_tiles[x].append([])
                map_tiles[x][y] = mapTile.MapTile()
