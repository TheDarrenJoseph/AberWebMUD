import logging
from pony.orm import *
from pyfiles.db import db_instance, attributes

class Stats(db_instance.DatabaseInstance._database.Entity):
    health_val = Required(int, default=100)
    charclass = Required(str, default='fighter')
    character = Required('Character')

    @db_session
    def get_json(self) -> dict:
        json = {'health':self.health_val, 'charclass':self.charclass}
        logging.info('Retrieved stats! '+str(json))
        return json
