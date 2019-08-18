from pyfiles.db import db_instance, database, character
from pyfiles.model import overworld
from pony.orm import *

POSITION_JSON_NAME = 'position'
POSITION_X_JSON_NAME = 'pos_x'
POSITION_Y_JSON_NAME = 'pos_y'

class Position(db_instance.DatabaseInstance._database.Entity):
    character = Optional('Character')
    pos_x = Required(int)
    pos_y = Required(int)

    @db_session
    def to_string(self) -> str:
        return str(self.pos_x)+str(self.pos_y)

    @db_session
    def set_position(self, x : int , y : int) -> None:
        self.pos_x = x
        self.pos_y = y

    @db_session
    def update_from_json(self, json_data):
        print('Updating position using: ' + str(json_data))
        position_updated = json_data[POSITION_JSON_NAME]

        if position_updated is not None:
            updated_x = position_updated[POSITION_X_JSON_NAME]
            updated_y = position_updated[POSITION_Y_JSON_NAME]

            if updated_x is not None and updated_y is not None:
                self.set_position(updated_x, updated_y)
            else:
                raise ValueError('Invalid Position values: {}, {}'.format(updated_x, updated_y))
        else:
            raise ValueError('Could not find position in json_data under key: {}'.format(POSITION_JSON_NAME))

    def get_json(self):
        return {'position': {
            POSITION_X_JSON_NAME: self.pos_x,
            POSITION_Y_JSON_NAME: self.pos_y
        }}