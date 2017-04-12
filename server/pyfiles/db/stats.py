import logging
from pony.orm import *
from pyfiles.db import db_instance, attributes

class Stats(db_instance.DatabaseInstance._database.Entity):
    health_val = Required(int, default=100)
    charclass = Required(str, default='fighter')
    character = Required('Character')
    attributes = Optional(attributes.Attributes)

    @db_session
    def get_json(self):
        json = {'health':self.health_val, 'charclass':self.charclass}

        #Sets the attributes to default if not found when needed
        if self.attributes is None:
            self.attributes = attributes.Attributes(stats=self)

        json.update(self.attributes.get_json())

        logging.info('Retrieved stats! '+str(json))
        return json
