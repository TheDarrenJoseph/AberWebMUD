from flask import Flask, request, render_template, session
from flask_socketio import SocketIO, send, emit

from pyfiles import userInput, playerController, player, overworld, database, crypto
import jsonpickle, threading, passlib, ssl

#Using TLS for HTTPS Support
#context = ssl.SSLContext(ssl.PROTOCOL_TLS)

#Create the app with our module name
app = Flask(__name__)

#Create our socketIO server
socketServer = SocketIO(app)

#Current connected  but unauthenticated sessions
connectedSessions = []

#Dict mapping of session IDs to usernames once authenticated/logged_in
activeSessions = {}

#This is our PonyORM db handler
_dbHandler = None

@app.route("/", methods=['GET'])
def main():
    return render_template('play.html') #Renders the game page from a file

#Sanity checks the JSON protocol message send from the client
def check_message_params(message: dict):
    print('CHECKING..')
    print(message)
    dataTag = 'data'
    paramTag = 'sessionJson'

    if dataTag in message:
        #Send the 'data' from the input to be checked
        inputParams = userInput.check_chat_input(message[dataTag])

        if inputParams is None:
            print('Missing input param data from protocol message')
        else:
            if ('choice' not in inputParams or dataTag not in inputParams):
                print('Missing user input paramaters in protocol message')
            elif (inputParams['choice'] == 1):
                #Checking our parsed data exists
                if (inputParams['data'] is None or 'username' not in inputParams['data'] or inputParams['data']['username'] is None):
                    print('Missing username in protocol  message (Probably not logged in)')
                else:
                    return (True, inputParams)
            elif (inputParams['choice'] == 2):
                print('User has sent a message')
                if ('data' in inputParams and 'messageData' in inputParams['data'] and inputParams['data']['messageData'] is not None):
                    return (True, inputParams)
                else:
                    print('No message data.')

    return (False,None)

#@socketServer.on('new-message', namespace='/')
def check_message(message: dict) -> None:
    print(message)

    sid = request.sid
    messageDetails = check_message_params(message)

    #True if the the message was properly formatted
    if (messageDetails[0] == True):
        inputParams = messageDetails[1]
        userChoice = inputParams['choice']
        userData = inputParams['data']

        if userChoice == 0:
            return
        elif userChoice == 1:
            username = inputParams['data']['username'] #user inputted username from client message
            foundPlayer = playerController.find_player(username)

            if foundPlayer is not None:
                if foundPlayer.username not in activeSessions:
                    print ('Requesting authentication for existing user..')
                    print(userData)
                    emit('request-password', username) #Send the password request for existing user
                else:
                    print('User already logged in..')
            else :
                print('User does not exist'+username)
                emit('request-new-password', username) #Send the password creation request for a new account

        elif userChoice == 2:
            username = message['sessionJson']['username'] #user inputted username from client message
            foundPlayer = playerController.find_player(username)

            if foundPlayer is not None:
                print (inputParams['data']['messageData'])
                send_message(userData)
            else:
                print('User must be logged in to message')

def send_message(message: dict) -> None:
    #DEBUG
    #print("new message with keys: %s" % message.keys())
    #print('message data:'+message['data'])

    #Rebroadcast the message dict
    emit('chat-message-response', message, broadcast=True)

#Prints the connected sessionIds and activeSessions to show auth handling
def list_sessions():
    print('Currently connected sessions: ')
    for s in connectedSessions:
        print(s)

    print('Currently active (authenticated) sessions: ')
    for s in activeSessions:
        print(s+' | '+activeSessions[s])

#Clears all connected session yet to be authenticated
def clear_session(sid):
    connectedSessions.remove(sid)

#Authenticates a user through username and password
def authenticate_user(data):
    sid = request.sid

    #hashedPassword = crypto.hash_password(data['password'])
    username = data['username']
    password = data['password']
    #print(hashedPass.salt)

    if _dbHandler.check_player_password(username, password):
        print('Logging in.. '+sid)
        activeSessions[sid] = username #add this sessionId:username to activeSessions

        #thisPlayer = jsonpickle.encode(playerController.find_player(username))
        playerStatus = playerController.find_player(username).create_player_status_response()
        print(playerStatus)

        emit('login-success', {'sessionId':sid, 'player-status':playerStatus})
        list_sessions()
    else:
        print('Password incorrect')

@socketServer.on('connect')
def send_welcome():
    print('NEW SESSION '+request.sid)
    connectedSessions.append(request.sid)
    emit('connection-response', {'messageData': 'Welcome! Please create a character or login by typing \'user [username] [charactername]\' ', 'sessionId':request.sid})
    #emit('status-response',statusResponse)
    list_sessions()
    connectionTimeout = threading.Timer(300, clear_session(request.sid))

def send_map_data():
    if (len(overworld.mapTiles) > 0):
        emit('map-data-response',{  'map-size-x': overworld.mapSizeX,
                                    'map-size-y': overworld.mapSizeY,
                                    'data': jsonpickle.encode(overworld.mapTiles)
                                }
            )

@socketServer.on('disconnect')
def handle_disconnect() -> None:
    if request.sid in activeSessions.keys():
        username = activeSessions[request.sid]
        del activeSessions[request.sid] #Remove the sessionId from our activeSessions dict
        print('Logged out '+username)
    print('Session disconnected'+request.sid)

#def command_response(player: player.Player):
#    message = {'success':True, 'posX':player.pos_x, 'posY':player.pos_y}
#    send_message(message)

def check_session(sessionId, username):
        if (sessionId in activeSessions) :
            if (activeSessions[sessionId] == username):
                print(activeSessions[sessionId])
                return True
            else:
                print('SessionID / Username mismatch! ('+sessionId+','+username+')')
        else:
            print(username+' not logged in or session not active')

        #Send a session-error event to the client
        emit('session-error')
        return False

def handle_movement(message: dict):
    #If the movment returns True, all is good and we can send back a movement response
    #move_player also checks if the username exists for us
    print('MOVEMENT MESSAGE: ')
    print(message)

    username = message['username']
    sessionId = message['sessionId']

    if(check_session(sessionId,username)):
        movedPlayer = playerController.find_player(username)

        if (movedPlayer is not None) :
            playerPos = playerController.get_player_pos(username)

            if playerPos is not None:
                oldX = playerPos[0]
                oldY = playerPos[1]
                movementSuccess = False
                print('Character move made from location'+str(oldX)+' '+str(oldY))

                if playerController.move_player(message):
                    movementSuccess = True
                    newPos = playerController.get_player_pos(username)

                    #Update every client to the new movement
                    emit('movement-update', {'username':message['username'],'oldX':oldX, 'oldY':oldY,'posX':newPos[0],'posY':newPos[1]}, broadcast=True)
                    print('movement success for'+movedPlayer.username)
                    print(str(oldX)+str(oldY)+" "+str(newPos[0])+str(newPos[1]))
                else:
                    #Send a failed response back to that one user
                    emit('movement-response', {'success':movementSuccess}, broadcast=False)
                    pass

#Sets up players, maps, etc
def setup_instance():
    overworld.create_map() #instanciate mapTiles
    print('MAP LOADED')

    thisPlayer = _dbHandler.make_test_player()
    print('TEST PLAYER:')
    print(thisPlayer)

#Checks that this is the first instance/main instance of the module
if (__name__ == "__main__"):
    #PonyORM Setup
    #Instanciate our database handler to allow lookups and creation
    _dbHandler = database.DatabaseHandler()
    _dbHandler.open_db()
    #dbHandler.clear_db(True) #DANGEROUS, resets all DB data for development

    setup_instance()

    #SocketsIO setup
    engineio_logger=True
    socketServer.on_event('new-chat-message',check_message)
    #socketServer.on_event('connect',send_welcome)
    socketServer.on_event('map-data-request',send_map_data)
    socketServer.on_event('movement-command',handle_movement)
    socketServer.on_event('client-auth', authenticate_user)

    #MAIN LOOP
    #app.run()
    socketServer.run(app)

    #Cleanup
    _dbHandler.close_db()
