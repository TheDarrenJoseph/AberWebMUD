import unittest
import sys
import os.path
from pyfiles import dice

class diceRollBad(unittest.TestCase):
    exception_response = -1

    def setUp(self):
        pass

    def test_dice_roll_invalid_face(self):
        self.assertEqual(dice.rollDice(1,101), self.exception_response) #Just over the face limit
        self.assertEqual(dice.rollDice(1,1), self.exception_response) #Single face count
        self.assertEqual(dice.rollDice(1,0), self.exception_response) #Zero face count
        self.assertEqual(dice.rollDice(1,-1), self.exception_response) #Negative face count

    def test_dice_roll_invalid_count(self):
        self.assertEqual(dice.rollDice(11,2), self.exception_response) #Just over the count limit
        self.assertEqual(dice.rollDice(0,2), self.exception_response) #Zero die
        self.assertEqual(dice.rollDice(-1,2), self.exception_response) #Minus die

if __name__ == "__main__":
    unittest.main()
