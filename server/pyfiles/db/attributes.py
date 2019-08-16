import logging
from pony.orm import Required, Optional, Set, db_session
from pyfiles.db import db_instance, attributeScore
from pyfiles import jsonChecker

ATTRIBUTE_NAMES = ['Strength', 'Agility', 'Arcana', 'Stealth']

class Attributes(db_instance.DatabaseInstance._database.Entity):
    # 1-1 Reverse attribute
    character = Required('Character', unique=True)
    free_points = Required(int, default=5)

    attribute_scores = Set('AttributeScore')

    @db_session
    def with_default_attributes(self):
        self.attribute_scores = [
            attributeScore.AttributeScore(attributes=self, name=ATTRIBUTE_NAMES[0], description='Influences your health and damage.'),
            attributeScore.AttributeScore(attributes=self, name=ATTRIBUTE_NAMES[1],
                                          description='Influences your ability to dodge attacks and land hits on your opponents.'),
            attributeScore.AttributeScore(attributes=self, name=ATTRIBUTE_NAMES[2],
                                          description='Your knowledge of ancient arcane arts practiced by Wizards and Witches.'),
            attributeScore.AttributeScore(attributes=self, name=ATTRIBUTE_NAMES[3],
                                          description='Your ability to move undetected by other creatures and players.')
        ]
        return self

    @db_session
    def get_attribute(self, name):
        return self.attribute_scores.select(lambda attrib: attrib.name == name).first()

    @db_session
    def set_attribute_value(self, name, value) :
        attrib = self.get_attribute(name)
        attrib.value = value

    @db_session
    def get_total_attribute_scores(self) -> int:
        score = 0
        for attrib in self.attribute_scores:
            logging.info('Current score for: ' + attrib.name + ' is ' + attrib.value)
            score += attrib.value

        return score

    def total_attribute_scores(self, attribJson: dict) -> int:
        score = 0;
        attribs_exist = jsonChecker.character_attribues_exist(attribJson, ATTRIBUTE_NAMES)
        if (attribs_exist):
            for attribName in self.ATTRIBUTE_NAMES:
                attrib = attribJson[attribName]
                logging.info('Current score for data: ' + attrib.name + ' is ' + attrib.value)
            return score
        return score

    @db_session
    def update_attribs_from_json(self, these_attribs: dict) -> None:
        for attribName in ATTRIBUTE_NAMES:
            if attribName in these_attribs:
                attribute_value = these_attribs[attribName]
                self.set_attribute_value(attribName, attribute_value)
            else:
                logging.error('Could not find attribute: ' + attribName + ' in update input.')
        logging.info('--UPDATED CHAR ATTRIBS--')

    @db_session
    def is_change_valid(self, new_attributes: dict) -> bool:
        old_score_total = self.get_total_attribute_scores()
        changed_score_total = self.total_attribute_scores(new_attributes)

        diff_score = old_score_total - changed_score_total

        # Check that we've only increased our attribs, and only by the amount of free-points
        if diff_score >= 0 and diff_score <= self.free_points:
            return True
        return False

    @db_session
    def get_json(self) -> dict:

        scores = {}
        for attribName in ATTRIBUTE_NAMES:
            scores[attribName] = self.get_attribute(ATTRIBUTE_NAMES[0])

        attributes = {'attributes': {
            'free_points': self.free_points
            }
        }
        attributes['scores'] = scores
        logging.debug(attributes)
        return attributes
