import player
import userInput

#username to Player mappings
players = {}

#Creates a player if they don't exist, returns true if success, false if user exists
def create_player(username, charname) -> bool:
    if username not in players:
        print ('creating user with uname '+username+' and charname '+charname)
        new_player = player.Player(username, charname)
        players[username] = new_player # {username: Player} mapping
        return True
    return False

def is_logged_in(username: str) -> bool:
    if username in players:
        return players[username].logged_in
    else: return False

def log_in(username: str) -> bool:
    if username in players:
        if (not is_logged_in(username)) :
            players[username].logged_in = True
            return True
    return False

def log_out(username: str) -> bool:
    if username in players:
        if (players[username].logged_in == True) :
            players[username].logged_in = False
            return True
    return False

def find_player(username) -> player.Player:
    if username in players.keys():
        print ('finding user '+username)
        return players[username]
    else:
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
