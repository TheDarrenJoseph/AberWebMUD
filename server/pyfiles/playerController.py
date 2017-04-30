import logging
from pyfiles.db import database, player, character
from pyfiles import userInput, crypto, characterController
from pyfiles.model import  overworld
from pony.orm.core import ObjectNotFound
from pony.orm import db_session

#Checks for the Player in the DB using PonyORM
@db_session
def find_player(username : str) -> player.Player or None:
    try:
        return player.Player[username]

    except ObjectNotFound:
        return None

@db_session
def get_player_pos(username : str) -> (int, int) or None:
    if find_player(username) is not None:
        this_player = player.Player[username]

        if this_player is not None:
            position = this_player.character.position
            return(position.pos_x, position.pos_y)
        return None

@db_session
def get_character_json(username : str) -> dict or None:
    if find_player(username) is not None:
        this_player = player.Player[username]
        if this_player.character is not None:
            this_json = this_player.character.get_json()
            logging.info('Found character JSON: '+str(this_json))
            return this_json
    return None

@db_session
def get_player_status(username : str) -> dict or None:
    if find_player(username) is not None:
        thisPlayer = player.Player[username]
        return thisPlayer.get_json()
    return None

#Creates a new player database object
@db_session
def new_player(username : str, password : str) -> player.Player or None:
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
def check_movement(username : str, move_x : int, move_y : int) -> bool:
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
def move_player(username : str, move_x : int, move_y : int) -> bool:
    if username is not None and find_player(username) is not None:
        this_character = player.Player[username].character
        if this_character is not None:
            if check_movement(username, move_x, move_y):
                characterController.set_character_position(this_character.charname, move_x, move_y)
                print(str(move_x)+str(move_y)) #TODO DEBUG
                return True
    return False
