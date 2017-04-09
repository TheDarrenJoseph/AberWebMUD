from pyfiles.db import db_instance, stats, database, player, position
from pony.orm import *
#
# print(database)
class Character(db_instance.DatabaseInstance._database.Entity):
    charname = PrimaryKey(str)
    #Positions are stored relative to the map
    position = Required('Position')
    player = Required('Player')
    stats = Optional(stats.Stats)

    @db_session
    def set_charname(charname):
        this_character = Character[self.charname]
        if charname is not None:
            this_character.charname = charname

    @db_session
    def set_position(charname, this_position, this_player, this_stats):
        """ Sets character details, ignores any that are passed as None """
        this_character = Character[self.charname]
        if this_position is not None:
            this_character.position = this_position

    def set_player(this_player):
        this_character = Character[self.charname]
        if this_player is not None:
            this_character.player = this_player

    def set_stats(this_stats):
        this_character = Character[self.charname]
        if this_stats is not None:
            this_character.stats = this_stats

    @db_session
    def get_json(self):
        this_character = Character[self.charname]
        print(this_character)
        position = this_character.position

        return {'charname':charname, 'pos_x': position.pos_x, 'pos_y': position.pos_y}
