from pyfiles.db import position
from pyfiles.model import map

ovrwrld = None

class Overworld(map.Map):
    #Returns the starting position for all characters on the map
    def get_starting_pos(self) -> (int,int):
        _START_POS = (int(self.map_size_x/2),int(self.map_size_y/2)) #X,Y tuple of map midpoint
        _START_POS = position.Position(pos_x=_START_POS[0], pos_y=_START_POS[1])
        print ("Overworld starting pos: "+_START_POS.to_string())
        return _START_POS  #Return an X,Y tuple

def getOverworld():
    global ovrwrld
    if ovrwrld is None:
        ovrwrld = Overworld()
    return ovrwrld
