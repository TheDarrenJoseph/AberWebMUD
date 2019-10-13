import logging
from pyfiles.db import db_instance, character
#from pyfiles.db import character
from pony.orm import *

class Player(db_instance.DatabaseInstance._database.Entity):
    username = PrimaryKey(str)
    password = Required(str)
    character = Optional(character.Character, cascade_delete=True)

    def set_username(self, this_username) -> None:
        if this_username is not None:
            self.username = this_username

    def get_password(self) -> str :
        return self.password

    def set_password(self, this_password) -> None:
        if this_password is not None:
            self.password = this_password

    def get_character(self):
        return self.character

    def set_character(self, this_character) -> None:
        if this_character is not None:
            self.character = this_character

    """ 
        Returns player data needed for the client as a dict/JSON format
        This gets given to the client as a status response for a player
    """
    def get_json(self) -> dict:
        response = {'username': self.username}
        if self.character is not None:
            response.update(self.character.get_json())
        return response
