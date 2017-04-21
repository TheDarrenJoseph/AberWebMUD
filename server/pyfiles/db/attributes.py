#DB Object for storing RPG character attributes
import logging
from pony.orm import Required, db_session
from pyfiles.db import db_instance
from pyfiles import jsonChecker

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

    def get_total_attribute_scores_json(self, attribJson : dict) -> int:
        ATTRIBS_EXIST = jsonChecker.character_attribues_exist(attribJson)

        if (ATTRIBS_EXIST):
            score = attribJson['STR']+\
                    attribJson['DEX']+\
                    attribJson['CON']+\
                    attribJson['INT']+\
                    attribJson['WIS']+\
                    attribJson['CHA']
            return score
        return -1

    @db_session
    def update_attribs_from_json(self, these_attribs : dict) -> None:
        self.str_val = these_attribs['STR']
        self.dex_val = these_attribs['DEX']
        self.con_val = these_attribs['CON']
        self.int_val = these_attribs['INT']
        self.wis_val = these_attribs['WIS']
        self.cha_val = these_attribs['CHA']
        logging.info('--UPDATED CHAR ATTRIBS--')

    @db_session
    def is_change_valid(self, new_attributes : dict) -> bool:
        #TODO validate total changes against free-points
        old_score_total = self.get_total_attribute_scores()
        changed_score_total = self.get_total_attribute_scores_json(new_attributes)
        #total of changed attribute scores

        diff_score = old_score_total-changed_score_total

        #Check that we've only increased our attribs, and only by the amount of free-points
        if diff_score >= 0 and diff_score <= self.free_points:
            return True
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
