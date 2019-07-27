from pyfiles.model import tileEnum

# Shared size constants
MIN_SIZE_X = 1
MIN_SIZE_Y = 1
MAX_SIZE_X = 100
MAX_SIZE_Y = 100

# A literal tile map model
class Map:

    def is_traversible(self, x : int, y : int) -> bool:
        """ Checks both map bounds and traversibility for a given co-ord """
        if (x >= 0 and y >= 0 and x <= self.map_size_x-1 and y <= self.map_size_y-1):
            if self.map_tiles[x][y] is not None:
                return self.map_tiles[x][y].traversible
        else:
            return False

    # Verifies that the size inputs are valid, if so uses them
    def assign_size(self, size_x, size_y):
        if (size_x > MIN_SIZE_X and size_x < MAX_SIZE_X):
            self.map_size_x = size_x
        if (size_y > MIN_SIZE_Y and size_y < MAX_SIZE_Y):
            self.map_size_y = size_y

    def create_map(self, map_size_x, map_size_y) -> None:
        # validate/update map size
        self.assign_size(map_size_x, map_size_y)

        print(str(self.map_size_x) + ' ' + str(self.map_size_y))

        for x in range(self.map_size_x):
            self.map_tiles.append([]) #Appending a new list to allow indexing
            for y in range(self.map_size_y):
                self.map_tiles[x].append([])

                # Create a new default tile
                map_tile = tileEnum.TileEnum.grass_plain

                #Adding a random barrier tile for testing the map
                if x == 5 and y == 5:
                    map_tile = tileEnum.TileEnum.grass_bush

                self.map_tiles[x][y] = map_tile

    def __init__(self, map_size_x=20, map_size_y=20):
        self.map_size_x = None
        self.map_size_y = None
        self.map_tiles = []

        print ("New map attempt: "+str(map_size_x)+str(map_size_y))
        self.create_map(map_size_x, map_size_y)
