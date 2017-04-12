import logging
from pyfiles.db import player, character
from pyfiles import userInput,  playerController
from pyfiles.model import  overworld
from pony.orm.core import ObjectNotFound
from pony.orm import db_session

#Creates a new character and assigns it to a player
@db_session
def new_character(charname, username) -> player.Player:
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
def get_character_json(charname:str):
    try:
        this_character = character.Character[charname]
        return this_character.get_json()
    except ObjectNotFound:
        return None

#Checks for the Character in the DB using PonyORM
@db_session
def find_character(charname:str):
    try:
        return character.Character[charname]

    except ObjectNotFound:
        return None

@db_session
def update_character_from_json(character_json:dict) -> bool:
    data = character_json['data']
    username = character_json['sessionJson']['username']
    charname = data['charname']

    this_character = character.Character[charname]
    this_player = player.Player[username]

    if this_character is not  None and this_player is not None:
        this_character.set_charname(charname)
        this_character.stats.str_val = character_json['attributes']['STR']
        #TODO update the remaining info

    else:
        logging.info('Could not find a char or player for char update!')


@db_session
def update_character_details(character_json: dict) -> bool:
    data = character_json['data']
    username = character_json['sessionJson']['username']
    charname = data['charname']

    return True #CRITICAL FIX NEEDED

    #New character if first sign in (no character yet)
    if find_character(charname) is None:
        logging.debug('Creating a new character')
        #this_character = new_character(charname, username)

    #If we can find the player, update the character
    if playerController.find_player(username) is not None:
        logging.debug('Updating chardetails:' +str(this_character))
        logging.debug('Given info: '+str(character_json))
        return update_character_from_json(character_json)
    else:
        logging.debug('No matching user found for character update!')
