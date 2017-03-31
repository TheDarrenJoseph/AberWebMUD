""" Generates random dice rolls """
from random import randint

def rollDice(dice_num, face_count):
    #Sanity checking, no more than 10 d100 dice
    if dice_num > 10 or face_count > 100 or dice_num < 1 or face_count < 2:
        return -1

    total = 0
    for die in range(0, dice_num):
        total += randint(1, face_count) # rolls 1 to faceCount
    return total
