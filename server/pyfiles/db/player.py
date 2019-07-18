import logging
from pyfiles.db import db_instance, character
#from pyfiles.db import character
from pony.orm import *

class Player(db_instance.DatabaseInstance._database.Entity):
    username = PrimaryKey(str)
    password = Required(str)
    character = Optional(character.Character)


    """ 
        Returns player data needed for the client as a dict/JSON format
        This gets given to the client as a status response for a player
    """
    @db_session
    def get_json(self) -> dict:
        this_player = Player[self.username] #find the database entity for this (allows db_session)

        response = {'username': this_player.username}
        if this_player.character is not None:
            char_details = {'char-details' : this_player.character.get_json()}
            response.update(char_details)

        logging.debug('OUT| playerJSON: '+str(response))
        return response
