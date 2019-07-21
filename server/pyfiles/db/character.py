from pyfiles.db import db_instance, attributes   #position, player, database
from pony.orm import Required, Optional, db_session

class Character(db_instance.DatabaseInstance._database.Entity):
    # char_id = PrimaryKey(int, auto=True)
    charname = Required(str, unique=True)
    player = Required('Player', unique=True)
    # Positions are stored relative to the map
    position = Required('Position')
    health_val = Required(int, default=100)
    charclass = Required(str, default='fighter')
    attributes = Optional(attributes.Attributes)

    def get_charname(self) -> str:
        return self.charname

    def set_charname(self, charname : str) -> None:
        if charname is not None:
            self.charname = charname

    def get_player(self):
        return self.player

    def set_player(self, this_player) -> None:
        if this_player is not None:
            self.player = this_player

    def get_position(self):
        return self.position

    def set_position(self, this_position) -> None:
        if this_position is not None:
            self.position = this_position

    def get_health_val(self) -> int:
        return self.health_val

    def set_health_val(self, this_health_val) -> None:
        if this_health_val is not None:
            self.health_val = this_health_val

    def get_charclass(self) -> str:
        return self.charclass

    def set_charclass(self, this_charclass) -> None:
        if this_charclass is not None:
            self.charclass = this_charclass

    def get_attributes(self) -> str:
        return self.attributes

    def set_attributes(self, this_attributes) -> None:
        if this_attributes is not None:
            self.attributes = this_attributes

    def get_json(self) -> dict:
        response = {
            'character': {
                    'charname': self.charname,
                    'health': self.health_val,
                    'charclass': self.charclass,
                    'pos_x': self.position.pos_x,
                    'pos_y': self.position.pos_y
                   }
            }

        # Append attribs onto our JSON response
        response['character'].update(self.attributes.get_json())
        return response
