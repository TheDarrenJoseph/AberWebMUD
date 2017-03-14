import player, character, userInput, database, crypto, overworld
from pony.orm.core import ObjectNotFound
from pony.orm import db_session

#Checks for the Character in the DB using PonyORM
@db_session
def find_character(charname:str):
    try:
        return character.Character[charname]

    except ObjectNotFound:
        print('Character not found: '+charname)
        return None

#Checks for the Player in the DB using PonyORM
@db_session
def find_player(username:str):
    try:
        return player.Player[username]

    except ObjectNotFound:
        print('User not found: '+username)
        return None

@db_session
def get_player_pos(username:str):
    thisPlayer = player.Player[username]

    if (thisPlayer is not None):

        posX = thisPlayer.character.posX
        posY = thisPlayer.character.posY
        return(posX,posY)

    return None

#Creates a new player database object
def new_player(charname, username, password) -> player.Player:
    if find_character(charname) is None:
        startPos = overworld.get_starting_pos()

        #Create a new Character in the DB for the player to reference (PonyORM)
        thisCharacter = character.Character(charname=charname, posX=startPos[0], posY=startPos[1])
        passwordHashString = crypto.hash_password(password) #hashes and salts the pass for storage

        if find_player(username) is None:
            #Creating a new Player Entity through PonyORM
            thisPlayer = player.Player(character=thisCharacter, username=username, password=passwordHashString)
            return thisPlayer
    return None

def move_player(command: dict) -> None:
    print('MOVEMENT COMMAND TO FOLLOW')
    print(command)
    username = command['username']
    moveX = command['moveX']
    moveY = command['moveY']

    thisPlayer = find_player(username)
    if thisPlayer is not None:
        thisPlayer.posX = moveX
        thisPlayer.posY = moveY
        return True
    else:
        return False
