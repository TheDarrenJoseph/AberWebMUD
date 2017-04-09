import logging
from pyfiles.db import database, player, character
from pyfiles import userInput,  playerController
from pyfiles.model import  overworld
from pony.orm.core import ObjectNotFound
from pony.orm import db_session

#Creates a new character and assigns it to a player
@db_session
def new_character(charname, username) -> player.Player:
    if (charname is not None) and (find_character(charname) is None):
        start_pos = overworld.get_starting_pos()

        #Create a new Character in the DB for the player to reference (PonyORM)
        this_character = character.Character(charname=charname,
                                             pos_x=start_pos[0],
                                             pos_y=start_pos[1])
        return charname #Charname return confirms creation
    return None

#Checks for the Character in the DB using PonyORM
@db_session
def find_character(charname:str):
    try:
        return character.Character[charname]

    except ObjectNotFound:
        return None

@db_session
def update_character_details(characterJson:dict):
    data = characterJson['data']
    username = characterJson['sessionJson']['username']
    charname = data['charname']

    #Character Update
    if find_character(charname) is not None:
        this_character = character.Character[charname]
        this_character.charname = charname
        this_character.set_character(charname, posX, posY, this_player, this_stats)

        logging.debug('Ready to update chardetails:' +str(this_character))
        logging.debug('Given info: '+str(characterJson))
    else: #New character
        logging.debug('Creating a new character')
        return new_character(charname, username)

    return False
