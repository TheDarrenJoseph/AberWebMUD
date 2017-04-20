import unittest
import sys
import os.path
from pyfiles import dice

max_dice_face_val = 100
max_dice_count = 10

class diceRollGood(unittest.TestCase):

    def setUp(self):
        pass

    def check_value(self, dice_value, face_count):
        if dice_value > face_count or dice_value < 1:
            self.fail('Bad dice value: '+str(dice_value))

    #rollDice(diceNo, face_count)

    #Rolls each supported die type once and checks the range of results
    def test_dice_roll_single(self):
        for face_count in range (2, max_dice_face_val):
            dice_value = dice.rollDice(1, face_count)
            self.check_value(dice_value, face_count)

    #Rolls a 2 sided die 10 times, checking the range
    def test_dice_roll_min_face(self):
        for n in range (1,10):
            dice_value = dice.rollDice(1,2)
            self.check_value(1, 2)

    #Rolls the max supported die count many times and checks the range of results
    def test_dice_roll_many_max(self):
        die_face = 6
        max_range = 6*6
        for n in range (1, die_face):
            dice_value = dice.rollDice(max_dice_count, die_face)
            if dice_value > max_range or dice_value < 6:
                self.fail('Bad dice value: '+str(dice_value))

    #Rolls the min supported die count many times and checks the range of results
    def test_dice_roll_many_min(self):
        max_roll_result = 8
        for n in range (1,4):
            dice_value = dice.rollDice(4,2)
            self.check_value(dice_value, max_roll_result)

    #Test rolling the maximum number of dies at once
    def test_dice_roll_max(self):
        for n in range (1,2):
            dice_value = dice.rollDice(max_dice_count, 2)
            self.check_value(dice_value, 20)

    #Test rolling the maximum die face count multiple times (range check)
    def test_dice_roll_max(self):
        for n in range (1,2):
            dice_value = dice.rollDice(1, max_dice_face_val)
            self.check_value(dice_value, 20)

#Add a bad class

if __name__ == "__main__":
    unittest.main()
