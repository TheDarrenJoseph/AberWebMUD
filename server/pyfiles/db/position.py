from pyfiles.db import db_instance, database, character
from pony.orm import *

class Position(db_instance.DatabaseInstance._database.Entity):
    character = Optional('Character')
    pos_x = Required(int)
    pos_y = Required(int)
