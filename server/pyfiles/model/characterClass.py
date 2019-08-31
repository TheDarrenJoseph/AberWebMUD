from enum import Enum


class CharacterClass(Enum):
    Fighter = 'Fighter'
    Spellcaster = 'Spellcaster'
    Rogue = 'Rogue'


    @staticmethod
    def get_values():
        # Iterate all CharacterClass options, and build a list of their values
        return list(map(lambda charclass: charclass.value, CharacterClass.__iter__()))

    @staticmethod
    def get_json_options():
        keys = []
        for value in CharacterClass.get_values():
            keys.append(value)
        return {'options': keys}