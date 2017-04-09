import logging
from pyfiles.db import db_instance, character
#from pyfiles.db import character
from pony.orm import *

class Player(db_instance.DatabaseInstance._database.Entity):
    character = Optional(character.Character)
    username = PrimaryKey(str)
    #passwordSalt = Required(str, unique=True)
    password = Required(str)

    @db_session
    def get_json(self):
        """ Returns player data needed for the client as a dict/JSON format
            This gets given to the client as a status response for a player
        """

        this_player = Player[self.username] #find the database entity for this (allows db_session)

        response = None
        if this_player.character is not None:
            response = {'username':this_player.username,
                        'charname':this_player.character.charname,
                        'pos_x':this_player.character.pos_x,
                        'pos_y':this_player.character.pos_y
                       }
        else:
            response = {'username':this_player.username}

        logging.debug(response)
        return response
