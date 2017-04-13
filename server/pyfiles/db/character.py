from pyfiles.db import db_instance, stats, database, player, position
from pony.orm import *

class Character(db_instance.DatabaseInstance._database.Entity):
    #char_id = PrimaryKey(int, auto=True)
    charname = Required(str, unique=True)
    #Positions are stored relative to the map
    position = Required('Position')
    player = Required('Player', unique=True)
    stats = Optional(stats.Stats)

    @db_session
    def set_charname(self, charname):
        if charname is not None:
            self.charname = charname

    @db_session
    def set_position(self, this_position):
        if this_position is not None:
            self.position = this_position

    def set_player(self, this_player):
        if this_player is not None:
            self.player = this_player

    def set_stats(self, this_stats):
        if this_stats is not None:
            self.stats = this_stats

    @db_session
    def get_json(self):
        #this_character = Character[self.charname]
        #position = self.position
        response = {'charname':self.charname,
                    'pos_x': self.position.pos_x,
                    'pos_y': self.position.pos_y
                    }

        if self.stats is None:
            self.stats = stats.Stats(character=self)
        response.update(self.stats.get_json())
        return response
