import unittest
import sys
import os.path
from pyfiles import dice

class diceRollGood(unittest.TestCase):
    def setUp(self):
        pass

    #Rolls each supported die type once and checks the range
    def test_dice_roll_single(self):
        for face_count in range (2,100):
            dice_value = dice.rollDice(1, face_count)
            if dice_value > face_count or dice_value < 1:
                self.fail('Bad dice value: '+str(dice_value))

    #Rolls a 2 sided die 10 times, checking the range
    def test_dice_roll_many_min(self):
        for n in range (1,10):
            dice_value = dice.rollDice(1,2)
            if dice_value > 2 or dice_value < 1:
                self.fail('Bad dice value: '+str(dice_value))


    def test_dice_roll_many_max(self):
        pass

    def test_dice_roll_min(self):
        pass

    def test_dice_roll_max(self):
        pass

#Add a bad class

if __name__ == "__main__":
    unittest.main()
