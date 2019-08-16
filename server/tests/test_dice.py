import unittest
import sys
import os.path
from pyfiles import dice

min_dice_face_val = 2

max_dice_face_val = 100
max_dice_count = 10
max_max_range = max_dice_count*max_dice_count

class TestDiceRollGood(unittest.TestCase):

    def check_value(self, dice_value, face_count):
        self.assertLessEqual(dice_value, face_count)
        self.assertGreaterEqual(dice_value, 1)

    #Rolls each supported die type once and checks the range of results
    def test_dice_roll_single(self):
        for face_count in range(2, max_dice_face_val):
            dice_value = dice.rollDice(1, face_count)
            self.check_value(dice_value, face_count)

    #Rolls a 2 sided die 10 times, checking the range
    def test_dice_roll_min_face(self):
        for n in range(1, 10):
            dice_value = dice.rollDice(1, min_dice_face_val)
            self.check_value(dice_value, min_dice_face_val)

    #Rolls the max supported die count many times and checks the range of results
    def test_dice_roll_many_max(self):
        die_face = 6
        max_range = max_dice_count*6
        #Roll as many times as we have die_faces
        for n in range(1, die_face):
            dice_value = dice.rollDice(max_dice_count, die_face)

            # Lowest possible
            self.assertGreaterEqual(dice_value, max_dice_count)
            # Total should be less than or equal to the max value
            self.assertLessEqual(dice_value, max_range)

    #Rolls the min supported die count many times and checks the range of results
    def test_dice_roll_many_min(self):
        max_roll_result = 8
        for n in range(1, 4):
            dice_value = dice.rollDice(4, 2)
            self.check_value(dice_value, max_roll_result)

    #Test rolling the maximum number of dies at once
    def test_dice_roll_max_count(self):
        for n in range(1, 2):
            # Flip max_dice_count coins
            dice_value = dice.rollDice(max_dice_count, 2)
            self.check_value(dice_value, max_dice_count*2)

    #Test rolling the maximum die face count multiple times (range check)
    def test_dice_roll_max_faces(self):
        for n in range(1, 2):
            dice_value = dice.rollDice(1, max_dice_face_val)
            self.check_value(dice_value, max_dice_face_val)

class TestDiceRollBad(unittest.TestCase):
    exception_response = None

    def test_dice_roll_invalid_face(self):
        self.assertEqual(dice.rollDice(1, 101), self.exception_response) #Just over the face limit
        self.assertEqual(dice.rollDice(1, 1), self.exception_response) #Single face count
        self.assertEqual(dice.rollDice(1, 0), self.exception_response) #Zero face count
        self.assertEqual(dice.rollDice(1, -1), self.exception_response) #Negative face count

    def test_dice_roll_invalid_count(self):
        self.assertEqual(dice.rollDice(11, 2), self.exception_response) #Just over the count limit
        self.assertEqual(dice.rollDice(0, 2), self.exception_response) #Zero die
        self.assertEqual(dice.rollDice(-1, 2), self.exception_response) #Minus die


if __name__ == "__main__":
    unittest.main()
