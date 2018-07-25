""" Generates random dice rolls, nothing special just a randint wrapper """
from random import randint

# Can't roll less than 1 die
MIN_DICE_COUNT = 1
# 10 is a pretty sensible maximum per turn
MAX_DICE_COUNT = 10

# Cannot have a 1 sided die
MIN_DICE_FACE_COUNT = 2
# Largest you'd ever want to roll is a d100
MAX_DICE_FACE_COUNT = 100

#Emulate rolling a set of dice
def rollDice(dice_num : int, face_count : int) -> int:
    #Sanity checking, no more than 10 d100 dice
    if dice_num > MAX_DICE_COUNT or face_count > MAX_DICE_FACE_COUNT or dice_num < MIN_DICE_COUNT or face_count < MIN_DICE_FACE_COUNT:
        return None

    total = 0
    for die in range(0, dice_num):
        total += randint(1, face_count) # rolls 1 to faceCount
    return total
