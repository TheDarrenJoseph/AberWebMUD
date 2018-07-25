import unittest
import os.path
from pyfiles import dice, playerController
from pyfiles.db import database

max_movement_distance = 1
DB_HANDLER = None

username = 'foo'
password = 'test'

def setUpModule():
    DB_HANDLER = database.DatabaseHandler()
    DB_HANDLER.open_db()

def tearDownModule():
    DB_HANDLER.close_db()

class movePlayerCheckGood(unittest.TestCase):
    """ Tests movement validation
        testing method: check_movement(username : str, move_x : int, move_y : int) -> bool
    """

    def check_player_move_min(self):
        player1 = playerController.new_player(username, password)

        self.assertTrue(playerController.check_movement(username, 0, 0))

    def check_player_move_max(self):
        pass

class movePlayerCheckBad(unittest.TestCase):
    """ Tests movement validation
        testing method: check_movement(username : str, move_x : int, move_y : int) -> bool
    """

    def check_player_move_too_far(self):
        """ Player moves beyond movement restriction """
        pass

    def check_player_move_under_min(self):
        pass
    def check_player_move_over_max(self):
        pass

class movePlayerGood(unittest.TestCase):
    """ Tests full player movement """
    def move_player_min(self):
        pass
    def move_player_max(self):
        pass

class movePlayerBad(unittest.TestCase):
    """ Tests full player movement """
    def move_player_too_far(self):
        pass
    def move_player_under_min(self):
        pass
    def move_player_over_max(self):
        pass

if __name__ == "__main__":
    unittest.main()
