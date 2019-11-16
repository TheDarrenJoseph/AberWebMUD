from pyfiles.db import db_instance, attributes
from pyfiles.model import characterClass
from pyfiles.db.attributes import ATTRIBUTES_JSON_NAME, ATTRIBUTE_SCORES_JSON_NAME
from pony.orm import Required, Optional, db_session

import re

CHARACTER_DATA_JSON_NAME = 'character'

CHARACTER_VALIDATION_ERROR = ValueError('Character Details Invalid')

class Character(db_instance.DatabaseInstance._database.Entity):
    # char_id = PrimaryKey(int, auto=True)
    charname = Optional(str, unique=False, default='')
    charname_regex = re.compile('[a-z, ]+', re.IGNORECASE)
    charclass = Required(str, default=characterClass.CharacterClass.Fighter.value)
    player = Required('Player', unique=True)
    # Positions are stored relative to the map
    position = Required('Position')
    health_val = Required(int, default=100)
    attributes = Optional(attributes.Attributes, cascade_delete=True)
    details_valid = False

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

    def get_charclass(self) -> characterClass.CharacterClass:
        return characterClass.CharacterClass[self.charclass]

    def set_charclass(self, this_charclass: characterClass.CharacterClass) -> None:
        if this_charclass is not None:
            if isinstance(this_charclass, characterClass.CharacterClass):
                self.charclass = this_charclass.value
            else:
                raise TypeError('Expected a CharacterClass instance! received: ' + str(this_charclass))
        else:
            raise ValueError('Provider CharacterClass was None!')

    def get_attributes(self):
        return self.attributes

    def set_attributes(self, this_attributes) -> None:
        if this_attributes is not None:
            self.attributes = this_attributes

    # Allows external adjustments to this Character
    # Not all fields can be adjusted by this method
    def update_from_json(self, json_data):
        character = json_data[CHARACTER_DATA_JSON_NAME]

        print('Update character from: ' + str(character))
        character_name = character['charname']
        character_class_str = character['charclass']
        character_class = characterClass.CharacterClass[character_class_str]
        self.set_charname(character_name)
        self.set_charclass(character_class)
        self.position.update_from_json(character)

        # Pick out only the 'attributes' from 'data'
        self.attributes.update_from_json(character)
        return True

    def validate_charname(self):
        length_valid = len(self.charname) > 0
        characters_valid = self.charname_regex.match(self.charname)
        if length_valid and characters_valid:
            return True
        else:
            raise ValueError('Character name is required to be non-zero and matching the following pattern: ' + str(self.charname_regex))

    def validate_details(self):
        try:
            self.validate_charname()
            self.attributes.validate_details()
        except ValueError as validation_error:
            # Raise a generic validation error with the _cause wrapped
            raise CHARACTER_VALIDATION_ERROR from validation_error

    def get_json(self) -> dict:
        response = {
            CHARACTER_DATA_JSON_NAME: {
                    'charname': self.charname,
                    'health': self.health_val,
                    'charclass': self.charclass,
                    'position': self.position.get_json()['position']
                   }
            }

        # Append attribs onto our JSON response
        response['character'].update(self.attributes.get_json())
        return response
