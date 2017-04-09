import logging
from pyfiles.db import database, player, character
from pyfiles import userInput, crypto
from pyfiles.model import  overworld
from pony.orm.core import ObjectNotFound
from pony.orm import db_session

#Checks for the Player in the DB using PonyORM
@db_session
def find_player(username:str):
    try:
        return player.Player[username]

    except ObjectNotFound:
        return None

@db_session
def get_player_pos(username:str):
    thisPlayer = player.Player[username]

    if thisPlayer is not None:
        pos_x = thisPlayer.character.pos_x
        pos_y = thisPlayer.character.pos_y
        return(pos_x, pos_y)
    return None

@db_session
def set_player_pos(username:str, x:int, y:int):
    thisPlayer = player.Player[username]

    if thisPlayer is not None:
        thisPlayer.character.pos_x = x
        thisPlayer.character.pos_y = y
        return True
    return False

@db_session
def get_player_status(username):
    if find_player(username) is not None:
        thisPlayer = player.Player[username]
        return thisPlayer.get_json()
    return None

#Creates a new player database object
@db_session
def new_player(username, password) -> player.Player:
    if username is not None \
    and password is not None:
        if find_player(username) is None:
            password_hash_string = crypto.hash_password(password) #hashes and salts the pass for storage

            #Creating a new Player Entity through PonyORM
            this_player = player.Player(character=None,
                                        username=username,
                                        password=password_hash_string)
            return username #Username return confirms creation
    return None

#Returns true or false based on whether or not the movement is valid
def check_movement(username, move_x, move_y) -> bool:
    this_pos = get_player_pos(username)
    pos_x = this_pos[0]
    pos_y = this_pos[1]

    #Basic sanity check (1 or more tiles distance)
    if (move_x > pos_x+1 or move_x < pos_x-1 or
        move_y > pos_y+1 or move_y < pos_y-1):
        return False
    else:
        return True

@db_session
def move_player(command: dict) -> bool:
    print('MOVEMENT COMMAND TO FOLLOW')
    print(command)
    username = command['username']
    move_x = command['moveX']
    move_y = command['moveY']

    if check_movement(username, move_x, move_y):
        if set_player_pos(username, move_x, move_y):
            print(str(move_x)+str(move_y)) #DEBUG
            #Position updated
            return True
        else:
            #Issue actually setting position value
            return False
    else:
        #Invalid movement
        return False
