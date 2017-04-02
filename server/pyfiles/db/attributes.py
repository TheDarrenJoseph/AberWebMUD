#DB Object for storing RPG character attributes
import logging
from pony.orm import *
from pyfiles.db import db_instance

class Attributes(db_instance.DatabaseInstance._database.Entity):
    stats = Required('Stats')
    free_points = Required(int)
    str_val = Required(int)
    dex_val = Required(int)
    con_val = Required(int)
    int_val = Required(int)
    wis_val = Required(int)
    cha_val = Required(int)

    @db_session
    def get_json(self):
        this_attrs = Attributes[self]

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

def get_default_attributes():
    return Attributes(stats=stats.get_default_stats(),
    str_val=1,
    dex_val=1,
    con_val=1,
    int_val=1,
    wis_val=1,
    cha_val=1)
