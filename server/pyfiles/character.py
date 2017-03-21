from pyfiles import database, player
from pony.orm import *

class Character(database.DatabaseHandler._database.Entity):
    charname = PrimaryKey(str)
    #Positions are stored relative to the map
    posX = Required(int)
    posY = Required(int)
    player = Optional('Player')
