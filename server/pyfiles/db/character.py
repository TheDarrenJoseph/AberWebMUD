#
from pyfiles.db import db_instance, stats, database, player
from pony.orm import *
#
# print(database)
class Character(db_instance.DatabaseInstance._database.Entity):
    charname = PrimaryKey(str)
    #Positions are stored relative to the map
    pos_x = Required(int)
    pos_y = Required(int)
    player = Optional('Player')
    stats = Optional(stats.Stats)

    @db_session
    def get_json(self):
        this_character = Character[self.charname]
        print(this_character)
        return {'charname':charname, 'pos_x':pos_x, 'pos_y': pos_y}
