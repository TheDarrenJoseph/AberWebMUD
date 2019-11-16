import logging
from pony.orm import Required, Optional, Set, db_session
from pyfiles.db import db_instance, attributeScore
from pyfiles import jsonChecker

ATTRIBUTE_NAMES = ['Strength', 'Agility', 'Arcana', 'Stealth']
ATTRIBUTES_JSON_NAME = 'attributes'
ATTRIBUTE_MIN_VALUE_JSON_NAME = 'min_value'
ATTRIBUTE_MAX_VALUE_JSON_NAME = 'max_value'
ATTRIBUTE_SCORES_JSON_NAME = 'scores'
ATTRIBUTE_FREEPOINTS_JSON_NAME = 'free_points'


class Attributes(db_instance.DatabaseInstance._database.Entity):
    # 1-1 Reverse attribute
    character = Required('Character', unique=True)
    # min is zero (default) but technically invalid
    min_value = Required(int, default=0)
    max_value = Required(int, default=100)
    free_points = Required(int, default=5)

    attribute_scores = Set('AttributeScore')

    def with_default_attributes(self):
        self.attribute_scores = [
            attributeScore.AttributeScore(attributes=self, name=ATTRIBUTE_NAMES[0],
                                          description='Influences your health and damage.'),
            attributeScore.AttributeScore(attributes=self, name=ATTRIBUTE_NAMES[1],
                                          description='Influences your ability to dodge attacks and land hits on your opponents.'),
            attributeScore.AttributeScore(attributes=self, name=ATTRIBUTE_NAMES[2],
                                          description='Your knowledge of ancient arcane arts practiced by Wizards and Witches.'),
            attributeScore.AttributeScore(attributes=self, name=ATTRIBUTE_NAMES[3],
                                          description='Your ability to move undetected by other creatures and players.')
        ]
        return self

    def validate_details(self):
        for score in self.attribute_scores:
            if (score.value <= self.min_value or score.value > self.max_value):
                raise ValueError('Score value for score: ' + score.name + ' : ' + score.value +
                                 ' must be within bounds: [' + self.min_value + ' - ' + self.max_value + ']')
        return True

    @db_session
    def get_attribute(self, name):
        matching = self.attribute_scores.select(lambda attrib: attrib.name == name).first()
        return matching

    def set_attribute_value(self, name, value):
        attrib = self.get_attribute(name)
        attrib.value = value

    def get_total_attribute_scores(self) -> int:
        score = 0
        for attrib in self.attribute_scores:
            logging.info('Current score for: ' + attrib.name + ' is ' + attrib.value)
            score += attrib.value

        return score

    def sum_attribute_scores(self, attrib_json: dict) -> int:
        score = 0;
        attribs_exist = jsonChecker.character_attribues_exist(attrib_json, ATTRIBUTE_NAMES)
        if (attribs_exist):
            for attribName in self.ATTRIBUTE_NAMES:
                attrib = attrib_json[attribName]
                logging.info('Current score for data: ' + attrib.name + ' is ' + attrib.value)
            return score
        return score

    def is_change_valid(self, new_attributes: dict) -> bool:
        old_score_total = self.get_total_attribute_scores()
        changed_score_total = self.sum_attribute_scores(new_attributes)

        diff_score = old_score_total - changed_score_total

        # Check that we've only increased our attribs, and only by the amount of free-points
        if diff_score >= 0 and diff_score <= self.free_points:
            return True
        return False

    def update_from_json(self, json_data: dict) -> None:
        attribute_scores = json_data[ATTRIBUTES_JSON_NAME][ATTRIBUTE_SCORES_JSON_NAME]

        for attribName in ATTRIBUTE_NAMES:
            if attribName in attribute_scores:
                attribute_value = attribute_scores[attribName]
                self.set_attribute_value(attribName, attribute_value)
            else:
                logging.error('Could not find attribute: ' + attribName + ' in update input.')
        logging.info('--UPDATED CHAR ATTRIBS--')

    def get_scores(self):
        scores = {}
        for attribName in ATTRIBUTE_NAMES:
                attrib = self.get_attribute(attribName)
                if attrib is not None:
                    scores[attribName] = attrib.value
        return scores

    def get_json(self) -> dict:
        scores = self.get_scores()
        attributes = {ATTRIBUTES_JSON_NAME: {
            ATTRIBUTE_MIN_VALUE_JSON_NAME: self.min_value,
            ATTRIBUTE_MAX_VALUE_JSON_NAME: self.max_value,
            ATTRIBUTE_FREEPOINTS_JSON_NAME: self.free_points,
            ATTRIBUTE_SCORES_JSON_NAME: scores
        }}
        logging.debug(attributes)
        return attributes

    def get_json_attribute_scores(self):
        scores = self.get_scores()
        return {'scores': scores}

    @staticmethod
    def get_json_attribute_score_options():
        return {'options' : ATTRIBUTE_NAMES}