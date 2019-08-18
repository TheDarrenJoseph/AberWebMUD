from enum import Enum


class CharacterClass(Enum):
    Fighter = 'Fighter'
    Spellcaster = 'Spellcaster'
    Rogue = 'Rogue'

    @staticmethod
    def get_json_options():
        keys = []
        for charclass in CharacterClass:
            keys.append(charclass.value)
        return {'options': keys}