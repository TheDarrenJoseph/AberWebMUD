import logging
from pony.orm import *
from pyfiles.db import db_instance, attributes

class Stats(db_instance.DatabaseInstance._database.Entity):
    health_val = Required(int)
    character = Optional('Character')
    attributes = Optional(attributes.Attributes)

    @db_session
    def get_json(self):
        logging.debug(self.health_val)
        return {'health':self.health_val}

def get_default_stats():
    return Stats(health_val=100)
