from pony.orm import Required, Optional, db_session
from pyfiles.db import db_instance


class AttributeScore(db_instance.DatabaseInstance._database.Entity):
    attributes = Required('Attributes')
    name = Required(str)
    value = Required(int, default=0)
    description = Optional(str)

    def get_name(self):
        return self.name

    def set_name(self, name):
        self.name = name

    def get_value(self):
        return self.value

    def set_value(self, value):
        self.value = value

    def get_json(self):
        response = {
            'name': self.name,
            'value': self.value
        }
        return response
