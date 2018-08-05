from pyfiles.db import position
from pyfiles.model import map
from pony.orm import Required, Optional, db_session

class Overworld(map.Map):
    OVERWORLD_SIZE_X = 22
    OVERWORLD_SIZE_Y = 22

    #Returns the starting position for all characters on the map
    @db_session
    def get_starting_pos(self) -> (int,int):
        _START_POS = position.Position(character=None, pos_x=int(self.map_size_x/2), pos_y=int(self.map_size_y/2))
        print ("Overworld starting pos: "+_START_POS.to_string())
        return _START_POS

    def __init__(self):
         super().__init__(self.OVERWORLD_SIZE_X, self.OVERWORLD_SIZE_Y)

# Keep a global instance so we don't have to pass it around
ovrwrld = None
def getOverworld():
    global ovrwrld
    if ovrwrld is None:
        ovrwrld = Overworld()
    return ovrwrld
