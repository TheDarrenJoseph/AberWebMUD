import logging
from pyfiles.db import player
from pyfiles.model import overworld
from pyfiles import crypto, characterController
from pony.orm.core import ObjectNotFound
from pony.orm import db_session

NO_PLAYER_FOUND = ValueError('Unable to find a player with that username')

#Checks for the Player in the DB using PonyORM
@db_session
def find_player(username: str) -> player.Player or None:
    try:
        return player.Player[username]
    except ObjectNotFound:
        logging.error('Could not find a Player for the given username: ' + username)
        return None

def find_player_or_throw(username: str) -> player.Player :
    this_player = find_player(username)
    if this_player is not None:
        return this_player
    else:
        raise NO_PLAYER_FOUND

#Checks an unhashed password against the salt/hash in the DB using passlib
def check_player_password(username, password):
    found_player = find_player_or_throw(username)
    valid_password = False
    if found_player is not None:
        valid_password = crypto.verify_password(password, found_player.password)
        return found_player, valid_password
    return False, valid_password

@db_session
def get_player_pos(username: str) -> (int, int) or None:
    this_player = find_player_or_throw(username)
    position = this_player.character.position
    return(position.pos_x, position.pos_y)

@db_session
def get_player_character(username: str):
    this_player = find_player_or_throw(username)
    this_character = this_player.get_character()
    if this_character is not None:
        return this_character
    else:
        return None

@db_session
def get_character_attributes(username: str):
    this_character = get_player_character(username)
    if this_character is not None:
        return this_character.get_attributes()
    else:
        raise None

@db_session
def get_character_json(username: str) -> dict or None:
    this_player = find_player_or_throw(username)
    if this_player.character is not None:
        this_json = this_player.character.get_json()
        logging.info('Found character JSON: '+str(this_json))
        return this_json
    else:
        logging.error('Could not find a character for the given username: ' + username)
    return {}

"""
Returns either None or JSON describing the player in a client-friendly manner
"""
@db_session
def get_json(username: str) -> dict or None:
    if find_player(username) is not None:
        return player.Player[username].get_json()
    return None


@db_session
def validate_character_details(username):
    find_player_or_throw(username).get_character().validate_details()

"""
GIVEN A Player has logged in
WHEN They request their Player details
AND Character details are invalid (not set?)
THEN a ValueError is thrown to indicate this
OTHERWISE the data, or None is returned as normal
"""
@db_session
def validate_and_get_json(username: str) -> dict or None:
    find_player_or_throw(username).get_json()

#Creates a new player database object
@db_session
def new_player(username: str, password : str) -> player.Player or None:
    if username is not None \
    and password is not None:
        if find_player(username) is None:
            #hashes and salts the pass for storage
            password_hash_string = crypto.hash_password(password)

            #Creating a new Player Entity through PonyORM
            this_player = player.Player(character=None,
                          username=username,
                          password=password_hash_string)

            return this_player
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
