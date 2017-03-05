#This will eventually be some form of map object loaded in from a database
#Just using simple test values for now
import mapTile

mapSizeX = 50
mapSizeY = 50
mapTiles = []

def create_map():
    if not mapTiles:
        for x in range(mapSizeX):
            mapTiles.append([]) #Appending a new list to allow indexing
            for y in range(mapSizeY):
                mapTiles[x].append([])
                mapTiles[x][y] = mapTile.MapTile()
