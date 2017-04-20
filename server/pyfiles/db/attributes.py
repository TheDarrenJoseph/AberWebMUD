#DB Object for storing RPG character attributes
import logging
from pony.orm import *
from pyfiles.db import db_instance

class Attributes(db_instance.DatabaseInstance._database.Entity):
    character = Required('Character')
    free_points = Required(int, default=5)
    str_val = Required(int, default=1)
    dex_val = Required(int, default=1)
    con_val = Required(int, default=1)
    int_val = Required(int, default=1)
    wis_val = Required(int, default=1)
    cha_val = Required(int, default=1)

    @db_session
    def get_total_attribute_scores(self) -> int:
        score = self.str_val+\
                self.dex_val+\
                self.con_val+\
                self.int_val+\
                self.wis_val+\
                self.cha_val
        return score

    @db_session
    def is_change_valid(self, new_attributes : dict) -> bool:
        #score = self.get_total_attribute_scores()

        #TODO if ()

        return False

    @db_session
    def get_json(self) -> dict:
        attributes = {
            'free_points': self.free_points,
            'STR':self.str_val,
            'DEX':self.dex_val,
            'CON':self.con_val,
            'INT':self.int_val,
            'WIS':self.wis_val,
            'CHA':self.cha_val
        }

        logging.debug(attributes)
        return attributes
