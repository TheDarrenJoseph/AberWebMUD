import logging
from pyfiles.db import player, character
from pyfiles import userInput,  playerController
from pyfiles.model import  overworld
from pony.orm.core import ObjectNotFound
from pony.orm import db_session

@db_session
def set_character_position(charname : str, x : int, y : int) -> bool:
    if find_character(charname) is not None:
        character.Character.get(charname=charname).position.set_position(x, y)
        return True
    return False

#Creates a new character and assigns it to a player
@db_session
def new_character(charname : str, username : str) -> player.Player:
    if (charname is not None) and (find_character(charname) is None):
        if playerController.find_player(username) is not None:
            start_pos = overworld.get_starting_pos()

            #Create a new Character in the DB for the player to reference (PonyORM)
            this_character = character.Character(charname=charname,
                                                 position=start_pos,
                                                 player=player.Player[username])

            logging.info('NEW CHAR: '+str(this_character)+'JSON: '+str(this_character.get_json()))

            return charname #Charname return confirms creation
    return None

#Checks for the Character in the DB using PonyORM
@db_session
def get_character_json(character_name : str) -> dict or None:
    try:
        this_character = character.Character.get(charname=character_name)
        return this_character.get_json()
    except ObjectNotFound:
        return None

#Checks for the Character in the DB using PonyORM
@db_session
def find_character(character_name : str) -> character.Character or None:
    try:
        return character.Character.get(charname=character_name)

    except ObjectNotFound:
        return None

@db_session
def update_character_from_json(character_json:dict) -> bool:
    username = character_json['sessionJson']['username']
    data = character_json['data']
    character_name = data['charname']
    character_class = data['charclass']

    this_character = character.Character.get(charname=character_name)
    this_player = player.Player[username]

    data = data['attributes'] #Pick out only the 'attributes' from 'data'
    if this_character is not  None and this_player is not None:
        this_character.set_charname(character_name)
        this_character.stats.charclass = character_class

        these_attribs = this_character.attributes
        these_attribs.update_attribs_from_json(data)

        logging.info(these_attribs.get_json())
        logging.info(this_character.get_json())
        return True

    else:
        logging.info('Could not find a char or player for char update!')
        return False

@db_session
def update_character_details(character_json : dict) -> bool:
    data = character_json['data']
    username = character_json['sessionJson']['username']
    charname = data['charname']

    #New character if first sign in (no character yet)
    if find_character(charname) is None:
        new_character(charname, username)

    #If we can find the player, update the character
    if playerController.find_player(username) is not None:
        return update_character_from_json(character_json)
    else:
        logging.info('No matching user found for character update!')
        return False
