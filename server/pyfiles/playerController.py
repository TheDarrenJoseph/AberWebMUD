import logging
from pyfiles.db import player
from pyfiles.model import overworld
from pyfiles import crypto, characterController
from pony.orm.core import ObjectNotFound
from pony.orm import db_session

#Checks for the Player in the DB using PonyORM
@db_session
def find_player(username: str) -> player.Player or None:
    try:
        return player.Player[username]

    except ObjectNotFound:
        return None

@db_session
def get_player_pos(username: str) -> (int, int) or None:
    if find_player(username) is not None:
        this_player = player.Player[username]

        if this_player is not None:
            position = this_player.character.position
            return(position.pos_x, position.pos_y)
        return None

@db_session
def get_character_json(username: str) -> dict or None:
    if find_player(username) is not None:
        this_player = player.Player[username]
        if this_player.character is not None:
            this_json = this_player.character.get_json()
            logging.info('Found character JSON: '+str(this_json))
            return this_json
    else:
        logging.error('Could not find a character for the given username: ' + username)
    return None

"""
Returns either None or JSON describing the player in a client-friendly manner
"""
@db_session
def get_player_status(username: str) -> dict or None:
    if find_player(username) is not None:
        return player.Player[username].get_json()
    return None

#Creates a new player database object
@db_session
def new_player(username: str, password : str) -> player.Player or None:
    if username is not None \
    and password is not None:
        if find_player(username) is None:
            #hashes and salts the pass for storage
            password_hash_string = crypto.hash_password(password)

            #Creating a new Player Entity through PonyORM
            player.Player(character=None,
                          username=username,
                          password=password_hash_string)

            return username #Username return confirms creation
    return None

@db_session
def remove_player(username: str):
    found_player = find_player(username)
    if found_player is not None:
        found_player.delete()
        print('Deleted player: ' + username)

def check_movement(username: str, move_x: int, move_y: int) -> bool:
    """ Returns true or false based on whether or not the movement is valid
        'valid' means within a +1 or -1 range of player(username)'s position
    """
    this_pos = get_player_pos(username)
    pos_x = this_pos[0]
    pos_y = this_pos[1]

    #Basic sanity check (1 or more tiles distance)
    if (move_x <= pos_x+1 and move_x >= pos_x-1 and
            move_y <= pos_y+1 and move_y >= pos_y-1 ):
        return overworld.getOverworld().is_traversible(move_x,move_y)
    return False

@db_session
def move_player(username: str, move_x: int, move_y: int) -> bool:
    if username is not None and find_player(username) is not None:
        this_character = player.Player[username].character
        if this_character is not None:
            if check_movement(username, move_x, move_y):
                characterController.set_character_position(this_character.charname, move_x, move_y)
                return True
    return False
