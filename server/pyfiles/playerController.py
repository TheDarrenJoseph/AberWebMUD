from pyfiles import player, character, userInput, database, crypto, overworld
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


@db_session
def set_player_pos(username:str, x:int, y:int):
    thisPlayer = player.Player[username]

    if (thisPlayer is not None):
        thisPlayer.character.posX = x
        thisPlayer.character.posY = y
        return True
    return False
#Creates a new player database object
@db_session
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

#Returns true or false based on whether or not the movement is valid
def check_movement(username, moveX,moveY) -> bool:
    thisPos = get_player_pos(username)
    posX = thisPos[0]
    posY = thisPos[1]

    #Basic sanity check (1 or more tiles distance)
    if (moveX > posX+1 or moveX < posX-1 or
        moveY > posY+1 or moveY < posY-1):
            return False
    else :
        return True

@db_session
def move_player(command: dict) -> None:
    print('MOVEMENT COMMAND TO FOLLOW')
    print(command)
    username = command['username']
    moveX = command['moveX']
    moveY = command['moveY']

    if check_movement(username, moveX, moveY):
        if set_player_pos(username, moveX, moveY):
            print(str(moveX)+str(moveY)) #DEBUG
            #Position updated
            return True
        else:
            #Issue actually setting position value
            return False
    else:
        #Invalid movement
        return False
