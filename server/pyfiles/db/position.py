from pyfiles.db import db_instance, database, character
from pony.orm import *

class Position(db_instance.DatabaseInstance._database.Entity):
    character = Optional('Character')
    pos_x = Required(int)
    pos_y = Required(int)

    @db_session
    def to_string(self):
        return str(self.pos_x)+str(self.pos_y)

    @db_session
    def set_position(x,y):
        self.pos_x = x
        self.pos_y = y
