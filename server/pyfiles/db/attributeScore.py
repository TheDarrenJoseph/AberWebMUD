from pony.orm import Required, Optional, db_session
from pyfiles.db import db_instance


class AttributeScore(db_instance.DatabaseInstance._database.Entity):
    attributes = Required('Attributes')
    name = Required(str)
    value = Required(int, default=0)
    description = Optional(str)

    @db_session
    def get_name(self):
        return self.name

    @db_session
    def set_name(self, name):
        self.name = name

    @db_session
    def get_value(self):
        return self.value

    @db_session
    def set_value(self, value):
        self.value = value

    @db_session
    def get_json(self):
        response = {
            'name': self.name,
            'value': self.value
        }
        return response
