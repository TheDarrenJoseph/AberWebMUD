import unittest
from pyfiles.db import database
from pyfiles.model import overworld

# Define a DB handler since we're creating entities that will need mapping
DB_HANDLER = None

def setUp(self) :
    print(self.__testMethodName)

def setUpModule():
    DB_HANDLER = database.DatabaseHandler()
    DB_HANDLER.open_db()

def tearDownModule():
    if DB_HANDLER is not None:
        DB_HANDLER.close_db()

class TestOverworldGood(unittest.TestCase):
    thisOverworld = overworld.getOverworld()

    def test_start_pos(self):

        #Ensure the x/y sizes of the overworld divide by 2
        self.assertEqual(0, self.thisOverworld.map_size_x % 2)
        self.assertEqual(0, self.thisOverworld.map_size_y % 2)

        #Ensure the overworld start position is exactly half it's size
        startPos = self.thisOverworld.get_starting_pos()
        self.assertTrue(isinstance(startPos.pos_x, int))
        self.assertTrue(isinstance(startPos.pos_y, int))
        self.assertEqual(int(self.thisOverworld.OVERWORLD_SIZE_X/2), startPos.pos_x)
        self.assertEqual(int(self.thisOverworld.OVERWORLD_SIZE_Y/2), startPos.pos_y)

if __name__ == "__main__":
    unittest.main()
