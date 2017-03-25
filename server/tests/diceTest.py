import unittest
from server.pyfiles import dice

class diceRollGood(unittest.TestCase):
    def test_dice_roll_single(self):
        for face_count in range (2,100):
            dice_value = dice.rollDice(face_count,1)
            if dice_value > faceCount or dice_value < 1:
                self.fail('Bad dice value: '+dice_value)

    def test_dice_roll_many_min(self):
        dice_value = dice.rollDice(2,1)
        if dice_value > faceCount or dice_value < 1:
            self.fail('Bad dice value: '+dice_value)

    def test_dice_roll_many_max(self):
        pass

    def test_dice_roll_min(self):
        pass

    def test_dice_roll_max(self):
        pass

#Add a bad class
